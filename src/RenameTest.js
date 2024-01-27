import { vendiaClient } from "./vendiaClient";
import React, { useEffect, useState } from "react";
const { client } = vendiaClient();

export const RenameTest = async(oldDeviceName, newDeviceName) => {
    try {

          const listTestResponse = await client.entities.test.list({
            readMode: 'NODE_LEDGERED',
            filter: {
              Device: {
                contains: oldDeviceName,
              },
            },
          });
          for (let i = 0; i < listTestResponse.items.length; i++) {
            await client.entities.test.update({
              _id: listTestResponse.items[i]._id,
              Device: newDeviceName,
            });
          }

      } catch (error) {
        console.log("Error is: ", error);
      }
    };
    
    export default RenameTest;