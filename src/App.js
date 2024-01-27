import { CreateTest } from './CreateTest';
import { DevicePage } from './DevicePage';
import { Navbar } from './Navbar';
import {Login} from './Login'
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {useState} from "react";
import { Org } from './Org';
import { AccessDenied } from './AccessDenied';
import { TestPage } from './TestPage';
import {ArchivePage} from './ArchivePage'
function App() {
  const [isAuth] = useState(localStorage.getItem("isAuth"));  /*Creates a variable that can be accessed by every component
                                                              Has 4 potential states: true, "admin", "user", null
                                                              When actor logs in, isAuth goes from null to either "admin" or "user"*/

  
  return (
    <Router>
      <div className = "App">

        {isAuth ? <Navbar/> : console.log("not signed in")} {/*Navbar will only load if isAuth = true*/}
        <Routes>
          {/*Most Routes will reroute to login page if isAuth = !true*/ }
          <Route path="/" element={isAuth ? (<DevicePage/>) : (<Navigate replace to={"/login"}/>)}/>             {/*Home Page is DevicePage.js*/}
          <Route path="/TestPage/:deviceName" element={isAuth ? (<TestPage/>) : (<Navigate replace to={"/login"}/>)}/>   {/*Data shows all tests for specicific device, :testName gets name of device*/}
          {/* <Route path="/CreateTest" element={isAuth ? (<CreateTest/>) : (<Navigate replace to={"/login"}/>)}/> */}
          <Route path = "/Admin" element = {isAuth === "admin" ? (<Org/>) : (<Navigate replace to={"/AccessDenied"}/>)}/>  {/*Org page will only display if isAuth set to "admin", else go to home*/}
          <Route path="/login" element={!isAuth ? (<Login/>) : (<Navigate replace to={"/"}/>)}/>
          <Route path ="/AccessDenied" element = {isAuth ? (<AccessDenied/>) : (<Navigate replace to={"/login"}/>)}/>
          <Route path="/TestPage" element={isAuth ? (<TestPage/>) : (<Navigate replace to={"/login"}/>)}/>
          <Route path = "/CreateTest/:deviceName" element = {isAuth === "admin" ? (<CreateTest/>): (<Navigate replace to={"/AccessDenied"}/>)}/>
          <Route path="/ArchivePage" element={isAuth ? (<ArchivePage/>) : (<Navigate replace to={"/login"}/>)}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
