import React, { useLayoutEffect } from "react";
import { vendiaClient } from "./vendiaClient";
import { Box } from "@mui/system";
import { CircularProgress, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Fab, FormControlLabel, FormGroup, TextField, Typography, Snackbar, Alert, useMediaQuery, useTheme} from "@mui/material";
import { useMemo, useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Check, Delete, Edit } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import UpdateTest from "./UpdateTest";
import { EditTest } from "./EditTest";
import { DeleteTests } from "./DeleteTests";
import { MarkTestsComplete } from "./MarkTestsComplete";
import { lightBlue } from "@mui/material/colors";
import { EditOrgs } from "./EditOrgs";

import UpdateProgress, { status } from "./UpdateProgress";
const { client } = vendiaClient();

export const TestPage = () => {
    
    const [tests, setTests] = useState([]);

    const [rowId, setRowId] = useState(null); 
    const [testUp, setTestUp] = useState(null);
    
    const [org, setOrg] = useState();
    const [testName, setTestName] = useState();
    const [testMethod, setTestMethod] = useState();
    const [notes, setNotes] = useState();
    const [isCompleted, setIsCompleted] = useState();
    const [submitToggle, setSubmitToggle] = useState(false);
    const infoUp = (params) => {
        setRowId(params.id);
        setTestUp(params);
        setOrg(params.OrgAssignment)
        setTestName(params.TestName)
        setTestMethod(params.TestMethod)
        setNotes(params.Notes)
        setIsCompleted(params.Completed)
    }
    

    const [isEditing, setIsEditing] = useState(false);
    const handleCloseEditing = () => {
        setIsEditing(false)
    }
    const [success, setSuccess] = useState(false)
    const [editFailed, setEditFailed] = useState(false)

    const email = localStorage.getItem("isEmail")
    const adminRegEx = new RegExp("admin");
    const adminCheck = adminRegEx.test(email);

    const [user, setUser] = useState();
    useEffect(() => {
        const listUser = async () => {
            const listUserResponse = await client.entities.user.list({
                readMode: 'NODE_LEDGERED',
                filter: {
                    UserName: {
                        contains: email
                    }
                }
            })
            setUser(listUserResponse?.items)
        }
        listUser();
        console.log(user);
    }, [])

    //checks if user has same org as row
    // let inOrg;
    const OrgRegExp = (rOrg) => {
        if(adminCheck){
            return true;
        }
        let orgString = rOrg;
        const commaCheck = /,/;
        const needsParsing = commaCheck.test(orgString); //checking if org of the row has comma
        let orgArray;
        let orgCheck;
        if (needsParsing) {
            orgArray = orgString.split(',') //splitting string into array; creates new index in array every comma
            console.log(orgArray)
            if(orgArray.length > 2){
                for(let i = 0; i < orgArray.length - 2; i++){
                orgCheck += orgArray[i] + "||" //add || to make sure user only needs to be in one of the orgs the row has rather than be in all the orgs at once
                }
                let lastOrg = orgArray[orgArray.length - 2].substring(0, orgArray[orgArray.length -2].length)
                orgCheck += lastOrg
            }else{
                orgCheck = orgString.substring(0, orgString.length-1);
            }
        }else{
            orgCheck = orgString;
        }
        console.log(orgCheck)
        const regEx = new RegExp(orgCheck);
        //testing user's org against the row's orgs
        const inOrg = regEx.test(user?.map((user) => {
            return user?.Org
        }))
        return inOrg; //boolean
    }

    const testDetails = (tests) => {
            const details = tests.map((tests) => {
                return {
                    id: tests._id,
                    Device: tests.Device,
                    TestID: tests.TestID,
                    OrgAssignment: tests.OrgAssignment,
                    TestName: tests.TestName,
                    TestMethod: tests.TestMethod,
                    Notes: tests.Notes,
                    Completed: tests.Completed,
                    UpdatedBy: tests.UpdatedBy,
                }
            })
            return details
        }
    //controls when the test list refreshes for the table
    const [listTestToggle, setListTestToggle] = useState(false);

    const { deviceName } = useParams();

    useEffect(() => {
        const listTest = async () => {
            const listTestResponse = await client.entities.test.list({
                readMode: 'NODE_LEDGERED',
                filter: {
                    Device: {
                        contains: deviceName
                    }
                }
            }) 
            setTests(listTestResponse?.items);
        }
        listTest();
        console.log(tests)
        //just a console message so you know when the new tests have be relisted
        return () => {
            console.log("Updated Tests")
        }
    }, [listTestToggle || deviceName]) //refreshes every time toggle and deviceName changes
    //^now it wont keep filtered results when going from View Tests to TestPage

    let detailTests =  testDetails(tests);    

    // const [archivedTest, setArchivedTest] = useState([])
    const [archivedDevices, setArchivedDevices] = useState([])

    useEffect(() => {
        const listArchivedDevices = async () => {
            const listArchivedDeviceResponse = await client.entities.device.list({
                readMode: 'NODE_LEDGERED',
                filter: {
                    Status: {
                        contains: "Inactive"
                    }
                }
            })
            setArchivedDevices(listArchivedDeviceResponse.items);
            console.log("Archived:", archivedDevices)
        }
        listArchivedDevices();
    }, [listTestToggle || deviceName])
    const ArchiveCheck = (device) => {
        if(adminCheck){ //return true so test can be editied
            return true;
        }
        for (let i = 0; i < archivedDevices.length; i++) {
            if(archivedDevices[i].Name === device)
                return false;
        }
        // console.log(archivedDevices.filter(value => value.Name === "D!"))
        // isNotArchived = archivedDevices.map(value => {
        //     if(value.Name === device)
        //         return false;
        // })
        return true
    }
    //console.log(tests);
    const theme = useTheme();
    const columns = useMemo( () => [
        // {field: '_id', headerName: 'ID', width: 60},
        {
            field: 'Device',
            headerName: 'Device',
            flex: 2,
        },
        {
            field: 'TestID', 
            headerName: 'ID', 
            flex: 1,
            editable: false
        },
        {
            field: 'OrgAssignment', 
            headerName: 'Organization', 
            flex: 2,
            editable: false
        },
        {
            field: 'TestName', 
            headerName: 'Test Name', 
            flex: 2,
            editable: false
        },
        {
            field: 'TestMethod', 
            headerName: 'Test Method', 
            flex: 2,
            editable: false
        },
        {
            field: 'Notes', 
            headerName: 'Notes', 
            flex: 4,
            editable: false,
            sortable: false,
        },
        {
            field: 'Completed', 
            headerName: 'Completed', 
            flex: 2,
            type: 'boolean',
            editable: false
        },
        {
            field: 'UpdatedBy', 
            headerName: 'Updated By', 
            flex: 2,
            editable: false
        },
        // {
        //     field: 'actions',
        //     headerName: 'Actions',
        //     type: 'action',
        //     renderCell: (params) => (
        //         <UpdateTest {...{
        //             params, 
        //             rowId, 
        //             setRowId,
        //             testUp,
        //             setTestUp,
        //             deviceName,
        //             listTestToggle,
        //             setListTestToggle,
        //             isEditing,
        //             setIsEditing 
        //         }}/>
        //     ),
        //     sortable: false,
        //     filterable: false,
        // },
        {
            field: 'actions',
            headerName: 'Edit',
            type: 'action',
            flex: 1,
            sortable:false,
            renderCell: (params) => (
                <Fab 
                onClick={() => {
                    console.log(params.row)
                    infoUp(params.row)
                    // setIsCompleted(params.row.Completed)
                    setIsEditing(true)
                    }}
                disabled={!OrgRegExp(params.row.OrgAssignment) || !ArchiveCheck(params.row.Device)}
                color="primary"
                sx={{
                    height:40,
                    width: 40,
                    
                }}
                >
                    <Edit/>
                </Fab>
            )
        },
    ], [user]) 

    //holds the tests that have been selected by checkbox
    const [selectedTests, setSelectedTests] = useState([])
    
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 600);
    const [isMediumScreen, setIsMediumScreen] = useState(window.innerWidth > 600 && window.innerWidth <= 960);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 960);
    const [columnVisibility, setColumnVisibilty] = useState({
        Notes: isLargeScreen,
        TestID: isMediumScreen || isLargeScreen,
        UpdatedBy: isMediumScreen || isLargeScreen,
        TestMethod: isMediumScreen || isLargeScreen,
        Edit: isMediumScreen || isLargeScreen,
    })
    const handleResize = () => {
        let screenWidth = window.innerWidth;
        setIsSmallScreen(screenWidth <= 600);
        setIsMediumScreen(screenWidth > 600 && screenWidth <= 960);
        setIsLargeScreen(screenWidth > 960);
        setColumnVisibilty( {
            Notes: isLargeScreen,
            TestID: isMediumScreen || isLargeScreen,
            UpdatedBy: isMediumScreen || isLargeScreen,
            TestMethod: isMediumScreen || isLargeScreen,
            actions: isMediumScreen || isLargeScreen,
        })
      };
    const [resizeToggle, setResizeToggle] =useState(false)  
    useEffect(() => {
      
    //    handleResize();
      // Add the event listener when the component mounts
      window.addEventListener('resize', handleResize());
  
      // Clean up the event listener when the component unmounts
      return () => {
        window.removeEventListener('resize', handleResize());
      };
    }, [resizeToggle]);

    return ( 
        
        <div className="bg-gray-100">
            <Snackbar 
            anchorOrigin={{ vertical: 'bottom', horizontal:'center'}}
            open={success}
            
            onClose={() => setSuccess(false)}
            >
                <Alert
                severity="success"
                >
                    Successful Test Edit
                </Alert>
            </Snackbar>
            <Snackbar 
            anchorOrigin={{ vertical: 'bottom', horizontal:'center'}}
            open={editFailed}
            onClose={() => setEditFailed(false)}
            >
                <Alert
                severity="error"
                >
                    Test Edit Failed
                </Alert>
            </Snackbar>

            <Dialog
            open={isEditing}
            onClose={handleCloseEditing}
            >
                {!submitToggle ? (
                    <div>
                        <DialogTitle
                        position={"relative"}
                        textAlign={"center"}
                        fontSize={26}
                        fontWeight={600}
                        >
                            Edit Test
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText display={"flex"} flexDirection={"column"} mb={2}>
                                <div>
                                    Device: {testUp?.Device}   
                                </div>
                                <div>
                                    TestID: {testUp?.TestID}
                                </div>
                                <div>
                                    Updated By: {testUp?.UpdatedBy}
                                </div>
                            </DialogContentText>
                            <DialogContentText
                            color={"black"}>
                                Organization:
                            </DialogContentText>
                            <EditOrgs
                            onOrgChange={(newOrg)=> {
                                setOrg(newOrg)
                            }}
                            inputString={org}
                            ></EditOrgs>
                            {/* <TextField 
                            size="small"
                            disabled={!adminCheck}
                            margin="dense"
                            type="string"
                            defaultValue={org}
                            onChange={(event) => {
                                setOrg(event.target.value) //this is just a placeholder for now
                            }}
                            /> */}
                            <DialogContentText
                            color={"black"}>
                                Test Name:
                            </DialogContentText>
                            <TextField 
                            size="small"
                            disabled={!adminCheck}
                            margin="dense"
                            type="string"
                            defaultValue={testName}
                            onChange={(event) => {
                                setTestName(event.target.value)
                            }}
                            />
                            <DialogContentText
                            color={"black"}>
                                Test Method:
                            </DialogContentText>
                            <TextField 
                            size="small"
                            disabled={!adminCheck}
                            margin="dense"
                            type="string"
                            defaultValue={testMethod}
                            onChange={(event) => {
                                setTestMethod(event.target.value)
                            }}
                            />    
                            <DialogContentText
                            color={"black"}>
                                Notes:
                            </DialogContentText>
                            <TextField 
                            size="large"
                            margin="dense"
                            type="string"
                            defaultValue={notes}
                            onChange={(event) => {
                                setNotes(event.target.value)
                                // console.log(notes)
                            }}
                            />
                            <FormGroup aria-label="position" row
                            color={"black"}
                            >
                                <FormControlLabel 
                                label="Completed: "
                                labelPlacement="start"
                                control={<Checkbox 
                                    sx={{color: "black"}}
                                    checked={isCompleted}
                                    onClick={() => {
                                        setIsCompleted(!isCompleted)
                                    }}
                                    />}
                                />
                            </FormGroup>
                        </DialogContent>
                        
                        <DialogActions>
                        
                            <Button
                            variant="contained"
                            color="grey"
                            onClick={handleCloseEditing}
                            >
                                Cancel
                            </Button> 
                                    
                            <Button 
                            variant="contained"
                            onClick={() => {
                                setSubmitToggle(true);
                                EditTest(
                                    rowId,
                                    org, 
                                    testName, 
                                    testMethod, 
                                    notes, 
                                    isCompleted,
                                    deviceName,
                                    {success, setSuccess, editFailed, setEditFailed, listTestToggle, setListTestToggle, setIsEditing, setSubmitToggle}
                                    )
                                // setSubmitToggle(false);
                                // handleCloseEditing()
                            }}
                            >
                                Save
                            </Button>
                        
                        </DialogActions>
                    </div>
                ) : (
                    <DialogContent>
                        <CircularProgress/>
                    </DialogContent>
                )}
                
                

            </Dialog>
            <Box 
            sx={{
                height: 450,
                width: '90%',
                marginLeft: '5%',
                marginBottom: '5%%'
            }}>
                <Typography
                variant= 'h3'
                component= 'h3'
                sx={{
                    fontFamily: 'Archivo',
                    font: 'SegeoUI',
                    textAlign: 'center',
                    mt:3, 
                    mb: 3,
                    fontWeight: 600,
                    
                }}
                >
                    Test Information
                </Typography>
                
                <div style={{
                    textAlign: 'left'
                }}>
                    <Button onClick={() => {
                        MarkTestsComplete(selectedTests, {listTestToggle, setListTestToggle});
                        
                    }}>
                        <Check sx={{
                            color: 'black'
                        }}/>
                        <div style={{
                            color: 'black',
                            fontWeight: 400
                        }}>
                         Mark Completed
                        </div>
                        
                    </Button>
                    {/* only appears if admin is logged in */}
                    {adminCheck ?
                        <Button onClick= {() => {
                            DeleteTests(selectedTests, {listTestToggle, setListTestToggle});
                        }}
                        >    
                            <Delete sx={{
                                color: 'black'
                            }} />
                            <div style={{
                                color: 'black',
                                fontWeight: 400,
                            }}> Delete Test
                            </div>
                            
                        </Button>
                    :(
                        <div></div>
                    )}
                </div>
                <DataGrid className="bg-white rounded-3xl border-2 border-sky-500/50"
                columns={columns}
                rows={detailTests}
                columnVisibilityModel={columnVisibility} 
                slots={{
                    toolbar: GridToolbar,
                }}
                sx={{
                    border: "2px solid",
                    borderColor: lightBlue[500],
                    // borderRadius: 1,
                    boxShadow:5,
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: "white",
                        borderTop:"2px solid",
                        borderColor: lightBlue[500],
                        borderBottom:"none",
                    },
                    '& .MuiDataGrid-columnHeaderRow':{
                        border: "none"
                    },
                    '& .MuiDataGrid-cell':{
                        border: "none"
                    },
                    '& .MuiDataGrid-row': {
                        borderRadius: 0,
                        
                        backgroundColor: "white",
                        borderTop: "2px solid black",
                        borderBottom: "2px solid black"
                        // borderColor: "lightgray",
                    },
                    '& .MuiDataGrid-row:hover': {
                        borderRadius: 0,
                        
                        backgroundColor: "#daeffb",
                        borderTop: "2px solid black",
                        borderBottom: "2px solid black",
                    },
                    '& .Uneditable':{
                        backgroundColor: "#dbdbdb",
                        borderTop: "2px solid black",
                        borderBottom: "2px solid black",
                        opacity: '55%'
                    },
                    '& .Uneditable:hover':{
                        backgroundColor: "#dbdbdb",
                        borderTop: "2px solid black",
                        borderBottom: "2px solid black",
                        opacity: '55%'
                    },
                    '& .Archived':{
                        backgroundColor: "#b3ffb3",
                        borderTop: "2px solid black",
                        borderBottom: "2px solid black",
                        opacity: '55%'
                    },
                    '& .Archived:hover':{
                        backgroundColor: "#b3ffb3",
                        borderTop: "2px solid black",
                        borderBottom: "2px solid black",
                        opacity: '55%'
                    }
                }}
                disableColumnMenu 
                editMode="row"
                hideFooterPagination
                checkboxSelection //adds checkboxes to select multiple rows
                onRowSelectionModelChange={(params) => {setSelectedTests(params)}} //passes all the tests that have been selected
                isRowSelectable = {(params) => {
                    return(
                        OrgRegExp(params.row.OrgAssignment) && ArchiveCheck(params.row.Device)
                    )
                }} //only allows rows with same org as user to be selected and if test not apart of archived device
                getRowClassName={(params) => {
                    if(OrgRegExp(params.row.OrgAssignment) && ArchiveCheck(params.row.Device)){
                        return ''
                    }else if(!ArchiveCheck(params.row.Device)){
                        return 'Archived' 
                    }
                    return 'Uneditable'
                }}
                onResize={() => setResizeToggle(!resizeToggle)}
                onRowClick={(params) => {
                    if(OrgRegExp(params.row.OrgAssignment) && ArchiveCheck(params.row.Device) && window.innerWidth <= 600){
                        infoUp(params.row)
                        setIsEditing(true)
                    }    
                }
                }
                getRowSpacing={params => ({
                    top: params.isFirstVisible ? 0 : 5,
                    bottom: params.isLastVisible ? 0 : 5,
                })}
                ></DataGrid>
            </Box>

        </div>

     );

}
