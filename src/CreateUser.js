import React from "react";
import {auth} from "./firebase-config";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { vendiaClient } from "./vendiaClient";
import { EditOrgs } from "./EditOrgs";
const { client } = vendiaClient();


export const CreateUser = ({setSuccess, failed, setFailed}) => {
    const [listTestToggle, setListTestToggle] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    //const [orgList, setOrgList] = useState();
    const [org, setOrg] = useState("");
    const [userList, setUserList] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [duplicateEmailError, setDuplicateEmailError] = useState("");
    
    let originalUser = auth.currentUser;  //when creating a new user, need to reset auth to current user

    // Get User list
    useEffect(() => {
        // Fetch user list from the backend and update the state
        const listUsers = async () => {
          try {
            const listUsersResponse = await client.entities.user.list({readMode: 'NODE_LEDGERED',});
            setUserList(listUsersResponse?.items || []);
          } catch (error) {
            console.error("Error fetching users:", error);
          }
        };
    
        listUsers();
      }, [listTestToggle]); // Trigger effect whenever userList changes
      const isDuplicateEmail = (newEmail) => {
        return userList.some((user) => user.UserName === newEmail);
      };
    //Create the new user/password in Firebase:
    const signUp = async (e) => {
        e.preventDefault();
    
        // Check if the email already exists in the userList
        const isDuplicate = userList.some(user => user.UserName === email);
        if (isDuplicate) {
          console.log("Email already exists.");
          setDuplicateEmailError(true);
          return;
        }
    
        try {
          // Create the new user/password in Firebase
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          console.log("Firebase User Created:", userCredential.user);
          auth.updateCurrentUser(userCredential.user);
    
          // Add user to the local state after Firebase user is created
          await addUser();
        } catch (error) {
          console.error("Error creating user:", error);
          setFailed(true);
        }
        if(!failed){
          setSuccess(true);
        }
      };
      const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setDuplicateEmailError(""); // Clear the duplicateEmailError when email changes
      };
    //Create new user in Vendia:
    const addUser = async () => {
        try {
          const addUserResponse = await client.entities.user.add({
            UserName: email,
            Org: org,
          });
    
          // Update local state with the new user
          setUserList(prevUsers => [...prevUsers, addUserResponse]);
        } catch (error) {
          console.error("Error adding user:", error);
          // Handle error if user addition fails
          setFailed(true);
        }
        setListTestToggle(!listTestToggle);
        if(!failed){
          setSuccess(true);
        }
      };
    // const admin = require('firebase-admin')
    
    // var serviceAccount = require("firebase-config.js")
    // admin.initializeApp({
    //     credential: admin.credential.cert(serviceAccount),
    // })

    // const deleteUserFromFirebase = async (email) => {
    //     let uid;
    //     uid = admin.auth().getUserByEmail(email)
    //     console.log(uid)
    
    //     deleteUser(uid)
    //     // admin.auth().deleteUser(uid);
    // };
    
    const deleteUserFromVendia = async (name) => {
        // First, retrieve the user's data from Vendia
        try {
          const listUsersResponse = await client.entities.user.list({
          readMode: 'NODE_LEDGERED',
          filter:{
              UserName:{
                  contains: name
              }
          }
          });
          console.log("response:", listUsersResponse?.items[0]._id)
          let rUser = listUsersResponse?.items[0]._id
          const deleteUserResponse = await client.entities.user.remove(rUser)  
        } catch (error) {
          console.log(error)
          setFailed(true);
        }
        if(!failed){
          setSuccess(true);
        }
    };
    
    const handleDeleteUser = () => {
        deleteUserFromVendia(selectedUser)
        // deleteUserFromFirebase(selectedUser);
    };

    //HandleSubmissions:
    const handleSubmitUser = (e) => {
        e.preventDefault();
    
        // Reset duplicate email error state
        const isDuplicate = isDuplicateEmail(email);
        if (isDuplicate) {
            setDuplicateEmailError("Email already exists. Please choose a different email.");
            return;
          }
        // Call signUp function to handle user creation and duplication check
        signUp(e);
      };
    //called when org is changed in child component
    const handleOrgChange = (newOrg) => {
        console.log("handleOrgChange called")
        setOrg(newOrg)
        console.log("org:", org)
    }

    return (
     <div className="m-8 justify-center ">
        {/*Form for new user*/}
        <form 
            className="rounded-lg border-2 border-sky-500 p-4 bg-white"
            // onSubmit={handleSubmitUser}
            >
            <h1>Create a New User</h1>
            <input
                className="rounded border-2 mt-4 p-1 border-sky-500/50 hover:border-sky-500 mx-2"
                type = "email" 
                placeholder="Enter your email" 
                value = {email}
                onChange={handleEmailChange}
            ></input>
            <input 
                className="rounded border-2 mt-4 p-1 border-sky-500/50 hover:border-sky-500 mx-2"
                type = "password" 
                placeholder="Enter you password" 
                value = {password}
                onChange={(e)=>setPassword(e.target.value)}
            ></input>
            <EditOrgs
                onOrgChange ={handleOrgChange}
                inputString = ""/>
             {duplicateEmailError && <p className="text-red-600">Email already exists. Please choose a different email.</p>}
             <button
  className="cursor-pointer m-2 py-1 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
  type="button" // Specify the button type as "button"
  onClick={handleSubmitUser} // Call the handleSubmitUser function on click
>
  Submit
</button>



        </form>
        <form className="rounded-lg border-2 border-sky-500 p-4 my-8 bg-white">
                     {/* Form for deleting a user */}
                     <div>
            <h2>Delete User</h2>
            <select
                className="rounded-3xl border-2 border-sky-500/50 hover:shadow-sky-500 hover:shadow-lg"
                onChange={(e) => setSelectedUser(e.target.value)}
            >
                <option value="">Select User to Delete</option>
                {userList?.map((user) => (
                <option key={user.UserName} value={user.UserName}>
                    {user.UserName}
                </option>
                ))}
            </select>
            <button
                className="cursor-pointer m-2 py-1 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
                onClick={handleDeleteUser}
            >
                Delete User
            </button>
            </div>
        </form>
    </div>
    
    );
}
export default CreateUser;