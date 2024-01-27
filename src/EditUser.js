import React from "react";
import { vendiaClient } from "./vendiaClient";
import { useEffect, useState } from "react";
import { EditOrgs } from "./EditOrgs";
const {client} = vendiaClient();

export const EditUser = ({setSuccess, failed, setFailed}) =>{
    const [userList, setUserList] = useState();
    const [user, setUser] = useState();
    const [orgString, setOrgString] = useState("");
    const [org, setOrg] = useState();
    const [userID, setUserId] = useState();
    //Get Org list:
    useEffect(() => {
        const listUser = async () => {
            const listUserResponse = await client.entities.user.list({readMode: 'NODE_LEDGERED'});
            setUserList(listUserResponse?.items);
        }
        listUser();
    }, [])
    //Get Org list:
    useEffect(() => {
        const listUserOrg = async () => {
            const listUserOrgResponse = await client.entities.user.list({
                readMode: 'NODE_LEDGERED',
                filter: {
                    UserName: {
                        contains: user,
                    },
                },

            });
            setOrgString(listUserOrgResponse?.items[0].Org);
            setUserId(listUserOrgResponse?.items[0]._id)
            console.log(orgString)
        }
        listUserOrg();
    }, [user])

const handleUserChange = (e) =>{
    console.log(e.target.value)
    setUser(e.target.value);
}

const handleOrgChange = (newOrg) => {
    setOrg(newOrg)
    console.log("org:", org)
}
const editUser = async () => {
    try {
        const response = await client.entities.user.update({
            _id: userID,
            Org: org,
        })
        console.log("update sent");  
    } catch (error) {
        console.log(error)
        setFailed(true);
    }
    if(!failed){
        setSuccess(true);
    }
    
}
const handleSubmit = (e) =>{
    e.preventDefault();
    console.log("SubmitUser:", user)
    console.log("SubmitOrg:", org)
    console.log("userID:", userID)
    editUser();
}
return(
    <div className="m-8 justify-center bg-white">
    <form 
        className = "rounded-lg border-2 border-sky-500 p-4"
        onSubmit = {handleSubmit}>
        <h1>Edit User Org</h1>
        <select
                className="rounded border-2 mt-4 p-1 border-sky-500/50 hover:border-sky-500 mx-2"
                onChange={handleUserChange}>
                {userList?.map((item)=>(
                    <option value = {item?.UserName}>{item?.UserName}</option>
                ))}
        </select>
        <EditOrgs
            onOrgChange={handleOrgChange}
            inputString = {orgString}
        />
        <button
            className="cursor-pointer m-2 py-1 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
            type = "submit">
        Submit
        </button>
    </form>
    </div>
);

};