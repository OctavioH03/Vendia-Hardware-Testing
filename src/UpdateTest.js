import { useState, useEffect} from "react";
import { vendiaClient } from "./vendiaClient";
import { Box, CircularProgress, Fab } from "@mui/material";
import { Check, Edit } from "@mui/icons-material";
import { Save } from "@mui/icons-material";
import { green, red } from "@mui/material/colors";
import { auth } from "./firebase-config";
import { Cancel } from "@mui/icons-material";
const { client } = vendiaClient();

export var failed = false; //made public to try to display error message but hasn't worked yet

const UpdateTest = ({
    params, 
    rowId, 
    setRowId,
    testUp,
    setTestUp,
    deviceName,
    listTestToggle,
    setListTestToggle,
    isEditing,
    setIsEditing
}) => {
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const [f, setF] = useState(false);
    const [totalTests, setTotalTests] = useState("")
    const [compTests, setCompTests] = useState([]);
    const restart = () => {
        setSuccess(false);
        failed = false;
        setF(false)
        
    }

    const updateOutcome = (failed) => {
        if (failed === false) {
            setLoading(false)
            setSuccess(true)
            setListTestToggle(!listTestToggle)
            setTimeout(restart, 5000)
        }else{
            setLoading(false)
            setTimeout(restart, 5000)
        }
    }

    const updateTest = async (testUp) => {
            setLoading(true);
            try {
                const updateTestResponse = await client.entities.test.update({
                    _id: rowId,
                    TestName: testUp?.TestName,
                    OrgAssignment: testUp?.OrgAssignment,
                    TestMethod: testUp?.TestMethod,
                    Notes: testUp?.Notes,
                    Completed: testUp?.Completed,
                    UpdatedBy: auth.currentUser.email
                })
                console.log(updateTestResponse);
            } catch (error) {
                console.error(error);
                setF(true)
                failed = true
            }finally{
                console.log(failed)
                const x = failed;
                updateOutcome(x);
            }
        //Next get specefic device ID
        const listDeviceResponse = await client.entities.device.list({
            readMode: 'NODE_LEDGERED',
            filter: {
                Name: {
                    contains: deviceName,
                },
            },
        })
        console.log("Device:", listDeviceResponse)

        //Next get list of total tests for device, set TotalTests to that num
        const listTotalTestResponse = await client.entities.test.list({
            readMode: 'NODE_LEDGERED',
            filter: {
                Device:{
                    contains: deviceName,
                },
            },
        })
        console.log("Total Tests", listTotalTestResponse)
        setTotalTests(listTotalTestResponse.items.length)

        //Next get list of completed tests for device, set CompTests to that num
        const listCompTestResponse = await client.entities.test.list({
            readMode: 'NODE_LEDGERED',
            filter:{
                Device:{
                    contains: deviceName,
                },
                _and:{
                    Completed: {
                        eq: true,
                    },
                },
            },
        })
        setCompTests(listCompTestResponse?.items)
        console.log("Comp Tests:",listCompTestResponse)

        //Next calculate the total percent and round that num
        var total = (listCompTestResponse.items.length/listTotalTestResponse.items.length) * 100;
        console.log("Total:", total)
        var rounded = Math.round(total);
        console.log("Rounded:", rounded)
        console.log(listDeviceResponse.items[0]._id)

        //Finally store that num in device progress
        const progressResponse = await client.entities.device.update({
            _id: listDeviceResponse.items[0]._id,
            Progress: rounded,
            Status: "Active",
        })

    }
    
    const handleSaveClick = () => {
        console.log(rowId);
        console.log(testUp);
        updateTest(testUp);
        setRowId(null);
        setTestUp(null);
        
    }

    return ( 
        <div>
            <Box
            sx= {{
                m:1,
                position: 'relative',
            }}
            >    
                <Fab
                sx={{
                    width: 40,
                    height: 40,
                    // top: -6,
                    // left: -6,
                    // zIndex: 2
                }}
                onClick={() => {
                    setIsEditing(true)
                }}
                // disabled={params.id === rowId || success || loading}
                >
                    <Edit></Edit>
                </Fab>
                {/* {success ? (
                    <Fab
                    color="primary"
                    sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "black",
                        '&:hover': {bgcolor: green[500]}
                    }}
                    >
                        <Check />
                    </Fab>
                ) : (
                    <Fab
                    color="success"
                    sx={{
                        width: 40,
                        height: 40,
                    }}
                    disabled={params.id !== rowId || loading}
                    onClick={handleSaveClick}
                    >
                        <Save />
                    </Fab>

                )} */}
                {/* displays cancel icon when there is error in update */}
                {/* {f ? (
                    <Cancel sx={{
                        color: "black",
                        '&:hover': {color: red[900]},
                        width: 40,
                        height: 40,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex:2
                    }}/>
                ) : (
                    <div></div>
                )}
                {loading && (
                    <CircularProgress 
                    size={52}
                    sx={{
                        color: "black",
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        zIndex: 1
                    }}
                    />
                )}  */}
            </Box>
        </div>
     );
}
 
export default UpdateTest;


