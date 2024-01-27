import { Link } from "react-router-dom";
import {signOut} from "firebase/auth";
import {auth} from "./firebase-config";
import  aces from './Aces.png';
import { useState } from "react";
import {useEffect} from 'react';
import { onAuthStateChanged} from 'firebase/auth';
import { Dropdown } from '@mui/base/Dropdown';
import { MenuButton } from '@mui/base/MenuButton';
import { Menu } from '@mui/base/Menu';
import { MenuItem } from '@mui/base/MenuItem'
import { vendiaClient } from "./vendiaClient";


export const Navbar = () => {
    const [authUser, setAuthUser] = useState(null); 
    //Checks which user is logged in:
    useEffect(()=>{
        const listen = onAuthStateChanged(auth, (user)=>{
            if(user) {
                setAuthUser(user)
            } else {
                setAuthUser(null);
            }
        });
        return () =>{
            console.log(localStorage.getItem("isAuth"));
            listen();
        }
    }, [])
    const signUserOut = () => {
        signOut(auth).then(() => {
          localStorage.clear();
          //setIsAuth(null);
          //window.location.pathname = "/login";
          console.log('sign out successful')
          console.log(localStorage.getItem("isAuth"))
          window.location.reload(false);  //refreshes page
        }).catch(error => console.log(error))
      }
      
      const { client } = vendiaClient();
      const [user, setUser] = useState();
      useEffect (() =>{
            const listUser = async () =>{
                
                const listUserResponse = await client.entities.user.list({
                    readMode: 'NODE_LEDGERED',
                    filter: {
                        UserName:{
                            contains: localStorage.getItem("isEmail")
                        }
                    }
                })
                setUser(listUserResponse?.items)
            }
            listUser();
            //console.log(user);
      }, [])

      const userOrg = user?.map((user) => {return user?.Org})

      
return (
        <nav className="navbar group">
            <h1 className="logo static">
                <img className="acesImgR group-hover:scale-100" src={aces} alt="" height={60} width={60}/>
                <Link to="/" className="text-4xl">Team Ace</Link>
                <img className="acesImgL group-hover:scale-100" src={aces} alt="" height={60} width={60}/>
            </h1>
            <div className="links static">
                <Link to="/">Devices</Link>
                <Link to="/TestPage">Tests</Link>
                <Link to="/ArchivePage">Archives</Link>
                {localStorage.getItem("isAuth") === "admin" && 
                <Link to="/Admin">Admin</Link>
                }

                <span className="ml-2">
                    <Dropdown className="navbarMenu">
                        <MenuButton className=" hover:text-rose-600 static">
                            { authUser ? <>{`${auth.currentUser.email}`}</> : <>Waiting...</>}
                        </MenuButton>
                        
                            <Menu
                            className="absolute bottom-0 left-0">
                                
                                <MenuItem className="font-medium text-sm text-ellipsis">
                                <>{`${userOrg}`}</>
                                </MenuItem>
                                <MenuItem
                                    className="font-medium cursor-pointer hover:text-rose-600"
                                    onClick={signUserOut}>Log Out
                                </MenuItem>
                            </Menu>
                        </Dropdown>

                </span>
            </div>
        </nav>
    );
}
