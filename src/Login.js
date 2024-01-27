import React from "react";
import {auth} from "./firebase-config";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState("");
    

    //Regex expressions, used to read email string:
    // const string1 = "OrgA,OrgB"
    // const reg3 = /string1/g
    // localStorage.setItem("orgAssignment", reg3)
    const reg1 = /admin/g
    const reg2 = /user/g
    
    //Sign in with username and password, set "isAuth" to either "admin" or "user":
    const signIn = (e) =>{
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then(()=>{
            if(reg1.test(email)) {
                localStorage.setItem("isAuth", "admin")
            }
            else if(reg2.test(email)){
                localStorage.setItem("isAuth", "user")
            }
            localStorage.setItem("isEmail", email)
            console.log(localStorage.getItem("isAuth"));
            window.location.reload(false);  //refreshes page
        }).catch((error)=>{
            console.log(error);
            setErrorMessage("Invaild password or email");
        });
    };
    
    return (
     <div className="loginPage h-screen flex items-center justify-center">
        <div className="bg-white shadow-lg flex p-1 rounded border-2 border-sky-400 border-opacity-50">
            <h1 className="items-center relative text-7xl font-extrabold m-4">Team Ace</h1>
            <form className="py-10 px-4" onSubmit={signIn}>
                <input 
                    className="p-1 rounded border-2 border-sky-400 border-opacity-50"
                    type = "email" 
                    placeholder="Enter your email" 
                    value = {email}
                    onChange={
                        (e)=>{setEmail(e.target.value)
                        setErrorMessage("")}}
                ></input>
                <p></p>
                <input
                    className="mt-4 p-1 rounded border-2 border-sky-400 border-opacity-50"
                    type = "password" 
                    placeholder="Enter you password" 
                    value = {password}
                    onChange={
                        (e)=>{setPassword(e.target.value)
                        setErrorMessage("")}}
                    ></input>
                    <p></p>
                    <button
                        className="mt-4 py-2 cursor-pointer m-2 px-16 rounded font-bold text-white bg-sky-500 hover:bg-sky-700"
                        type = "submit">
                        Log In
                    </button>
                    <h1 className="text-red-600 animate-bounce-short">
                        {errorMessage}
                    </h1>
            </form>
        </div>    
    </div>
    
    );
}
export default Login;