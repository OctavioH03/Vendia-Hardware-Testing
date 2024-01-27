import React, { useEffect, useState } from "react";
import Modal from 'react-modal';
import { vendiaClient } from "./vendiaClient";
import { useNavigate } from "react-router-dom";
import { ProgressBarX } from "./ProgressBarX";
import { Removetests } from "./Removetests";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { RenameTest } from "./RenameTest";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
const { client } = vendiaClient();

Modal.setAppElement('#root'); // Set the root element for the modal
const customModalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  content: {
    width: '400px', // Adjust the width as desired
    margin: 'auto',
    height: '300px', // Adjust the height as desired
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#fff',
    textAlign: 'center',
  }
};
const customModalStyles2 = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 100,
  },
  content: {
    width: '400px', // Adjust the width as desired
    margin: 'auto',
    height: '200px', // Adjust the height as desired
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#fff',
    textAlign: 'center',
  }
};
export const DevicePage = () => {
  const [name, setName] = useState("");
  const [listTestToggle, setListTestToggle] = useState(false);
  const [errorMessage1, setErrorMessage1] = useState("");
  const [errorMessage2, setErrorMessage2] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [allDeviceList, setAllDeviceList] = useState([]);
  const [editedDeviceName, setEditedDeviceName] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isModalOpen2, setModalOpen2] = useState(false);
  const [ogDeviceName, setOgDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    
    const listDevice = async () => {
      setLoading(true)
      const listDeviceResponse = await client.entities.device.list({
        readMode: 'NODE_LEDGERED',
        filter: {
            Status: {
                contains: "Active",
            },
        },
    })
    const listDeviceResponse2 = await client.entities.device.list({readMode: 'NODE_LEDGERED'})

      setDeviceList(listDeviceResponse?.items || []);
      setAllDeviceList(listDeviceResponse2?.items || []);
      console.log(listDeviceResponse)
    };
    const pageLoading = async() => {
      const loadingResponse = await listDevice();
      setLoading(false);
    }
    pageLoading()
  }, [listTestToggle]);

  const isDeviceNameDuplicate = (newDeviceName) => {
    return allDeviceList.some(device => device.Name === newDeviceName);
  };


  const addDevice = async () => {
    if (name.trim() === "") {
      console.log("Device name is empty or undefined.");
      return;
    }

    if (isDeviceNameDuplicate(name)) {
      console.log("Device name already exists.");
      setErrorMessage1("Invalid Device Name");
      return;
    }

    try {
      setLoading(true);
      const addDeviceResponse = await client.entities.device.add({
        Name: name,
        Status: "Active",
        Progress: 0,
      },
      {
        syncMode: 'NODE_LEDGERED',
      });

      const updatedList = [...deviceList, addDeviceResponse];
      setDeviceList(updatedList);
      setName("");
      setLoading(false);
      closeModal2();
    } catch (error) {
      console.error("Error adding device:", error);
      setFailed(true);
    }
    if(!failed)
      setSuccess(true);
    
  };

  const handleEditDeviceName = async () => {
    if (!selectedDeviceId || !editedDeviceName.trim()) {
      console.error("Invalid device ID or device name.");
      return;
    }

    if (editedDeviceName.trim() === "") {
      console.log("Device name is empty or undefined.");
      return;
    }

    if (isDeviceNameDuplicate(editedDeviceName)) {
      console.log("Device name already exists.");
      setErrorMessage2("Invalid Device Name");
      return;
    }
    try {
      setLoading(true);
      
      await client.entities.device.update({
        _id: selectedDeviceId,
        Name: editedDeviceName,
      },                
      {    
        syncMode: 'NODE_LEDGERED',
    })
     
      
      await RenameTest(ogDeviceName, editedDeviceName);
      //setListTestToggle(!listTestToggle)
      setOgDeviceName(editedDeviceName)
      closeModal();
      setLoading(false)
    } catch (error) {
      console.error("Error updating device name:", error);
      setFailed(true);
      setErrorMessage2("Error updating device name. Please try again later.");
    }
    if(!failed){
      setSuccess(true);
    }
  };


  
  const handleNameChange = (event) => {
    setName(event.target.value);
    setErrorMessage1("");
  };

  const openModal = (deviceName, deviceID) => {
    console.log("device name:", deviceName)
    setSelectedDeviceId(deviceID);
    setOgDeviceName(deviceName)
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedDeviceId(null);
    setEditedDeviceName('');
    setModalOpen(false);
    setErrorMessage2("");
    setListTestToggle(!listTestToggle)
    console.log("closeModal")
  };

  const cancelModal = () => {
    setSelectedDeviceId(null);
    setEditedDeviceName('');
    setModalOpen(false);
    setErrorMessage2("");
    //setListTestToggle(!listTestToggle)
  };

  const openModal2 = () => {
    setModalOpen2(true);
  }

  const closeModal2 = () => {
    setModalOpen2(false);    
    setListTestToggle(!listTestToggle)
    console.log("closeModal")
  }
  const cancelModal2 = () => {
    setModalOpen2(false);
  }
  
  const handleSubmit = (event) => {
    event.preventDefault();
    addDevice();
    
  };
  return (
    <div className="device-page bg-gray-100">
                  {loading ? (
                <div>
                    <CircularProgress size={60}
                    sx={{
                        position: 'relative',
                        top: 50
                    }}
                    ></CircularProgress>
                </div>
            ) : 
            
            (
            <div>
              <Snackbar 
              anchorOrigin={{ vertical: 'bottom', horizontal:'center'}}
              open={success}
              
              onClose={() => setSuccess(false)}
              >
                <Alert
                severity="success"
                >
                    Successful
                </Alert>
              </Snackbar>
              <Snackbar 
              anchorOrigin={{ vertical: 'bottom', horizontal:'center'}}
              open={failed}
              onClose={() => setFailed(false)}
              >
                <Alert
                severity="error"
                >
                    Failed
                </Alert>
              </Snackbar>
      {localStorage.getItem("isAuth") === "admin" && (
              <div className=" mt-2 mr-8 flex flex-col items-end">
                <button
                  className="py-2 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold mb-2"
                  onClick={openModal2}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  Add Device
                </button>
              </div>

            )
            }
  
      <div className="m-8 grid grid-cols-2 gap-4">

        {deviceList?.map((item, index) => (
          <div key={index} className="relative mb-4">
            <div className="rounded break-inside-avoid bg-white p-4 border border-sky-500/50 hover:shadow-sky-500 hover:shadow-lg">
              <h2 className="text-lg font-bold text-green-900 mb-2">{item?.Name}</h2>
              <p className={`m-2 ${item?.Status === 'Active' ? 'activeStatus' : ''}`}>
                Status: {item?.Status}
              </p>
              
              <button
                className="cursor-pointer m-2 py-1 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
                onClick={() => {
                  const name1 = "/TestPage/" + item?.Name;
                  console.log(name1);
                  navigate(name1);
                }}
              >
                View Tests
              </button>
              
              {localStorage.getItem("isAuth") === "admin" && (
                <button
                  className="cursor-pointer m-2 py-1 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
                  onClick={() => {
                    const name1 = "/CreateTest/" + item?.Name;
                    console.log(name1);
                    navigate(name1);
                  }}
                >
                  Create Test
                </button>
              )}
              
          <ProgressBarX bgcolor="lightgreen" progress={item?.Progress} height={30} />  
            </div>
            
            {localStorage.getItem("isAuth") === "admin" && (
              <div className="absolute top-0 right-0 mt-2 mr-2 flex flex-col items-end">
                <button
                  className="py-2 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold mb-2"
                  onClick={() => openModal(item?.Name, item?._id)}
                >
                  <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
                  Edit
                </button>
              </div>

            )
            }
          
          </div>
          
        ))}
      </div>
      <Modal
        isOpen ={isModalOpen2}
        onRequestClose={closeModal2}
        style={customModalStyles2}
        contentLabel="Create Device Modal"
      >
        <h2>Create Device</h2>
        
          <div>
            <input
              className="rounded border-2 mt-4 p-1 border-sky-500/50 hover:border-sky-500"
              placeholder="Create a new device"
              type="text"
              name="Name"
              value={name}
              onChange={handleNameChange}
            />
          </div>
          <h1 className="text-red-600">{errorMessage1}</h1>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSubmit}
            className="m-2 py-2 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
          >
            Save
          </button>
          <button
            onClick={cancelModal2}
            className="m-2 py-2 px-4 rounded bg-gray-500 text-white hover:bg-gray-700 hover:font-bold"
          >
            Cancel
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Edit Device Name Modal"
      >
        <h2>Edit Device Name</h2>
        {errorMessage2 && <div className="text-red-600 mb-2">{errorMessage2}</div>}
        <input
          type="text"
          value={editedDeviceName}
          onChange={(e) => setEditedDeviceName(e.target.value)}
          placeholder="Enter new device name"
          className="m-2 p-2 rounded border border-gray-500 w-full"
        />
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleEditDeviceName}
            className="m-2 py-2 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
          >
            Save
          </button>
          <button
            onClick={cancelModal}
            className="m-2 py-2 px-4 rounded bg-gray-500 text-white hover:bg-gray-700 hover:font-bold"
          >
            Cancel
          </button>
        </div>
        <Removetests
          deviceName={ogDeviceName}
          failed={failed}
          setFailed={setFailed}
          setSuccess={setSuccess}
          //listTestToggle={listTestToggle}
          //setListTestToggle={setListTestToggle}
          onCloseModal={closeModal}
        />
      </Modal>
      </div>
    )}
    </div>
  );
};