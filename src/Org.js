import React from "react";
import { vendiaClient } from "./vendiaClient";
import { useState, useEffect } from "react";
import { CreateUser} from "./CreateUser";
import { EditUser } from "./EditUser";
import { Snackbar, Alert } from "@mui/material";
const { client } = vendiaClient();

export const Org = () =>{

    const [orgName, setOrgName] = useState("");
    const [orgList, setOrgList] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [listTestToggle, setListTestToggle] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(""); // To store the selected organization
    
    const [success, setSuccess] = useState(false);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        // Fetch existing organizations and update orgList state
        const fetchOrgList = async () => {
            try {
                const orgsResponse = await client.entities.org.list({readMode: 'NODE_LEDGERED',});
                setOrgList(orgsResponse?.items || []);
            } catch (error) {
                console.error("Error fetching organizations:", error);
            }
        };

        fetchOrgList();
    }, [listTestToggle]);
    //Create new org:
    const addOrg = async () => {
        if (!orgName || orgName.trim() === "") {
            console.log("Organization name is empty or undefined.");
            return;
        }

        // Check for duplicate organization names
        const isDuplicateOrg = orgList.some(org => org.Name === orgName);
        if (isDuplicateOrg) {
            console.log("Organization name already exists.");
            setErrorMessage("Invalid Org Name")
            return;
        }

        try {
            const addOrgResponse = await client.entities.org.add({
                Name: orgName
            });
            console.log("Organization added successfully:", addOrgResponse);
            // Update orgList state with the new organization
            setOrgList([...orgList, addOrgResponse]);
        } catch (error) {
            console.error("Error adding organization:", error);
            // Handle the error, e.g., show an error message to the user
            setFailed(true);
        }
        setListTestToggle(!listTestToggle)
        if(!failed){
          setSuccess(true);
        }
    };
    // Remove an organization:
    const removeOrg = async () => {
    if (!selectedOrg) {
      return; // No organization selected
    }

    // Show a confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this organization?");

    if (!confirmed) {
      return; // If not confirmed, do nothing
    }

    try {
      await client.entities.org.remove(selectedOrg);
      console.log(`Organization with ID ${selectedOrg} removed successfully.`);
      // Update orgList state by filtering out the removed organization
      setOrgList(orgList.filter(org => org._id !== selectedOrg));
    } catch (error) {
      console.error("Error removing organization:", error);
      // Handle the error, e.g., show an error message to the user
      setFailed(true);
    }
    setListTestToggle(!listTestToggle);
    setSelectedOrg(""); // Reset the selected organization after removal
    if(!failed){
      setSuccess(true);
    }
  };

    //Handle Submissions:
    const handleOrgNameChange = (e) =>{
        setOrgName(e.target.value);
        setErrorMessage("")
    }
    const handleSubmit = (e) =>{
        e.preventDefault();
        addOrg();
    }

return(
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
      <h1 className="items-center relative text-4xl font-extrabold m-4" >Admin Page </h1>
        <div className="m-8 flex justify-center bg-white">
          
        
            <form
                className="inline-block rounded-lg border-2 border-sky-500 w-screen p-4"
                onSubmit={handleSubmit}>
                <h1>Create a New Organization </h1>
                <input 
                    className="rounded border-2 mt-4 p-1 border-sky-500/50 hover:border-sky-500 w-min"
                    placeholder="Organization Name"
                    type="text"
                    name="orgName"
                    value={orgName}
                    onChange={handleOrgNameChange}
                />
                <h1 className="text-red-600">
                    {errorMessage}
                </h1>
                <input
                    className="cursor-pointer m-2 py-1 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
                    type="submit"
                />
            </form>

        </div>
        <div className="m-8 flex justify-center bg-white">
        <form className="inline-block rounded-lg border-2 border-sky-500 w-screen p-4">
            {/* Organization selection dropdown and "Delete Org" button */}
          <div >
            <h2>Delete Organization</h2>
            <select
              value={selectedOrg}
              className="rounded border-2 mt-4 p-1 border-sky-500/50 hover:border-sky-500 w-min"
              onChange={e => setSelectedOrg(e.target.value)}
            >
              <option value="">Select Organization</option>
              {orgList.map(org => (
                <option key={org._id} value={org._id}>
                  {org.Name}
                </option>
              ))}
            </select>
            <button
                className="cursor-pointer m-2 py-1 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
                onClick={removeOrg}
            >
              Delete Org
            </button>
          </div>


            </form>


        </div>
        {/*Call the CreateUser Component*/}
        <CreateUser
        setSuccess={setSuccess}
        failed={failed}
        setFailed={setFailed}
        />
        <EditUser
        setSuccess={setSuccess}
        failed={failed}
        setFailed={setFailed}
        />

    </div>
)

};

export default Org;