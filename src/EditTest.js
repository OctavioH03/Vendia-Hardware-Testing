import { useState, useEffect } from "react";
import { Box, Snackbar } from "@mui/material";
import { auth } from "./firebase-config";
import { vendiaClient } from "./vendiaClient";
import { UpdateProgress } from "./UpdateProgress";

const { client } = vendiaClient();
export const  EditTest = async (
    rowId,
    org, 
    testName, 
    testMethod, 
    notes,
    isCompleted,
    deviceName, 
    {success, setSuccess, editFailed, setEditFailed, listTestToggle, setListTestToggle, setIsEditing, setSubmitToggle}
    ) => {
        const updateOutcome = (editFailed) => {
            if(!editFailed)
                setSuccess(true);
        }
        const updateTest = async () => {
            try {
                const updateTestResponse = await client.entities.test.update({
                    _id: rowId,
                    OrgAssignment: org,
                    TestName: testName,
                    TestMethod: testMethod,
                    Notes: notes,
                    Completed: isCompleted,
                    UpdatedBy: auth.currentUser.email,
                },
                {    
                    syncMode: 'NODE_LEDGERED',
                }
                );
                console.log(updateTestResponse);
                
                //updateProgressNum();
                await UpdateProgress(deviceName);
            } catch (error) {
                console.error(error);
                setEditFailed(true)
            }finally{
                console.log(editFailed)
                updateOutcome(editFailed);
            }

        }

        const toggle = async () => {
            const updateTestResponse = await updateTest()
            setListTestToggle(!listTestToggle)
            setSubmitToggle(false);
            setIsEditing(false);
        }
        toggle();
 
}