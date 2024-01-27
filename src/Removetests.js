import React from "react";
import { vendiaClient } from "./vendiaClient";
import { useState } from "react";
import { CircularProgress } from "@mui/material";
import { Box } from "@mui/material";
const { client } = vendiaClient();

export const Removetests = ({ deviceName, onCloseModal, failed, setFailed, setSuccess }) => {
  const [submitToggle, setSubmitToggle] = useState(false);

  const removeTestsAndDevice = async () => {
    try {
      console.log("Device ID:", deviceName);
      setSubmitToggle(true);
      // Fetch tests associated with the specific device
      const response = await client.entities.test.list({
        readMode: 'NODE_LEDGERED',
        filter: {
          Device: {
            contains: deviceName,
          },
        },
      
      }
      
      );
      const response2 = await client.entities.device.list({
        readMode: 'NODE_LEDGERED',
        filter: {
          Name: {
            contains: deviceName
          }
        }
      })

      
      console.log(response2)
      const tests = response?.items || [];

      // // Delete associated tests one by one
      // await Promise.all(tests.map(async (test) => {
      //   await client.entities.test.remove(test._id);
      //   console.log(`Test ${test._id} deleted successfully.`);
      // }));
      console.log("length:", response.items.length)
      for(let i = 0; i < response.items.length; i++)
      {
        console.log("removed test:", response.items[i]._id)
        const test = client.entities.test.remove(
          response.items[i]._id)
      }
      // Delete the device after associated tests are deleted
      const test2 = await client.entities.device.remove(response2.items[0]._id,
        {syncMode: 'NODE_LEDGERED'})
      //await client.entities.device.remove(response2[0]._id);

     

      console.log('Tests and device associated with the device removed successfully');
      setSubmitToggle(false)
    } catch (error) {
      console.error('Error removing tests and device associated with the device:', error);
      setFailed(true);
    }

    onCloseModal();
    if(!failed)
      setSuccess(true);
    //setListTestToggle(!listTestToggle);
  };

  return (
    <div>
  {!submitToggle ?
    <button
      className="border-2 border-spacing-1 border-sky-300 m-8 py-1 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
      onClick={() => removeTestsAndDevice()}
    >
      Remove Device
    </button>
  :
    <Box sx ={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <CircularProgress/>
    </Box>
  }
  </div>
  );
};