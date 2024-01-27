import React from "react";
import { vendiaClient } from "./vendiaClient";
import { useEffect, useState } from "react";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, FormControlLabel, FormGroup, TextField, Typography, Snackbar} from "@mui/material";
const {client} = vendiaClient();

export const EditOrgs = ({onOrgChange, inputString}) => {
    const [open, setOpen] = useState(false);
    const [curString, setCurString] = useState(inputString);
    const [orgList, setOrgList] = useState();

    //Get Org list:
     useEffect(() => {
         const listOrg = async () => {
             const listOrgResponse = await client.entities.org.list({readMode: 'NODE_LEDGERED',});
             setOrgList(listOrgResponse?.items);
         }
         listOrg();
     }, [])

    //Determines which checkbox's are marked by default depending on inputString
    //Also determines whether to remove or add a substring 
    const OrgRegExp = (checkName) => {
 
        let orgString = checkName;
        const commaCheck = /,/;
        const needsParsing = commaCheck.test(orgString); //checking if org of the row has comma
        let orgArray;
        let orgCheck = "";
        if (needsParsing) {
            orgArray = orgString.split(',') //splitting string into array; creates new index in array every comma
            for(let i = 0; i < orgArray.length - 1; i++){
                orgCheck += orgArray[i] + "||" //add || to make sure user only needs to be in one of the orgs the row has rather than be in all the orgs at once
            }
            orgCheck += orgArray[orgArray.length - 1] 
        }else{
            orgCheck = orgString;
        }
        const regEx = new RegExp(orgCheck);
        //testing user's org against the row's orgs
        const inOrg = regEx.test(curString)  //testString
        return inOrg; //boolean
    }

    //Opening the popup:
    const handleClickOpen = () => {
        setOpen(true);
        setCurString(inputString)
        console.log("inputString", inputString)
        console.log("cursTring:",curString)
      };
    //Closing the popup:
      const handleClose = () => {
        setOpen(false);
      };
    //Saving the org string
      const handleSave = () => {
        onOrgChange(curString) //send curString prop back to parent component
        handleClose()
        console.log(curString)
      };
    //Canceling the Org submition
      const handleCancel = () => {
        setCurString("");
        handleClose()
      };

      //When box is checked or unchecked, add or remove substring
      const onCheck = (string1) => {
        console.log("onCheck called");
        console.log("curString: ", curString);
        if(OrgRegExp(string1)){
            console.log("remove substring:")
            setCurString(curString.replace(string1 + ",", ""))
        }
        else{
            console.log("add substring")
            setCurString(curString + string1 + ",")
        }
      };

    return(
        <div >
            
            <Button className = "cursor-pointer m-2 py-1 px-4 rounded bg-sky-500 text-white hover:bg-sky-700 hover:font-bold"
                     onClick={handleClickOpen}>
                Set Orgs
            </Button>
            <Dialog
            open={open}
            onClose={handleClose}
            >
                <DialogTitle
                position = {"relative"}
                textAlign={"center"}
                >
                    Edit Orgs
                </DialogTitle>
                <DialogContent>
                    <FormGroup
                    >
                    {orgList && orgList.length > 0 ? (
                        orgList.map((item, index) => (
                            <FormControlLabel
                            label = {item?.Name}
                            labelPlacement="start"
                            control = {<Checkbox
                                
                                defaultChecked = {OrgRegExp(item?.Name)}
                                onClick={(e)=>onCheck(item.Name)}
                            />}
                        />                           

                        ))  
                    ) : (<p>no data yet, wait</p>)}      

                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button
                    variant="outlined"
                    onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                    variant = "outlined"
                    onClick ={handleSave}>
                        Save
                    </Button>

                </DialogActions>
            </Dialog>
        </div>

    );

};