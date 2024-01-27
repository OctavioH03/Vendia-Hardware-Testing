import { useEffect, useState } from "react";
import { vendiaClient } from "./vendiaClient";
import { useParams} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase-config";
import { list } from "postcss";
import { EditOrgs } from "./EditOrgs";
import { UpdateProgress } from "./UpdateProgress";
import { CircularProgress } from "@mui/material";
import { Box } from "@mui/material";

const { client } = vendiaClient();

export const CreateTest = () => {
    const [testName, setTestName] = useState("");
    const [testID, setTestID] = useState(""); // TestID as a number
    const [testMethod, setTestMethod] = useState(""); // TestMethod as a string
    const [notes, setNotes] = useState(""); // Notes as a string
    const [orgList, setOrgList] = useState();
    const [org, setOrg] = useState("");
    const [submitToggle, setSubmitToggle] = useState(false);
    
    const { deviceName } = useParams()

    let navigate = useNavigate();
    const [testList, setTestList] = useState([]);
    const [totalTests, setTotalTests] = useState("")
    
    //Creates list of tests with specific device name
    //Sets TotalTests to total number of tests
    useEffect(() => {
        const listOrg = async () => {
            const orgResponse = await client.entities.org.list({readMode: 'NODE_LEDGERED',});
            setOrgList(orgResponse?.items || []);
        };
        listOrg();

        const listTests = async () => {
            const testResponse = await client.entities.test.list({
                readMode: 'NODE_LEDGERED',
                filter: {
                    Device: {
                        contains: deviceName,
                    },
                },
            });
            setTestList(testResponse?.items || []);
            setTotalTests(testResponse.items.length);
            setTestID(testResponse.items.length+1)
        };
        listTests();
    }, [deviceName]);
    
    //Get Org list:
    useEffect(() => {
        const listOrg = async () => {
            const listOrgResponse = await client.entities.org.list({readMode: 'NODE_LEDGERED',});
            setOrgList(listOrgResponse?.items);
        }
        listOrg();
    }, []) 
    const isDuplicateTest = () => {
        return testList.some(test => test.TestName === testName);
    };
    const addTest = async () => {
        if (isDuplicateTest()) {
            console.log("Test name already exists.");
            return;
        }
        const email = auth.currentUser.email
        const addTestResponse = await client.entities.test.add({
            Device: deviceName,
            TestName: testName,
            TestID: testID, // TestID as a number
            OrgAssignment: org,
            TestMethod: testMethod, // TestMethod as a string
            Notes: notes, // Notes as a string
            Completed: false, // Completed as a boolean
            UpdatedBy: email,
        },
        {    
            syncMode: 'NODE_LEDGERED',
        }
        );
        console.log(addTestResponse);

        await UpdateProgress(deviceName)
    }

    const handleTestNameChange = (event) => {
        setTestName(event.target.value);
    }

    const handleTestMethodChange = (event) => {
        setTestMethod(event.target.value);
    }

    const handleNotesChange = (event) => {
        setNotes(event.target.value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!org || org.trim() === "") {
            console.log("Please select an organization.");
            // You can display an error message to the user, e.g., set a state variable for error message display
            return;
        }
        const submit = async() => {
            setSubmitToggle(true);
            const submitResponse = await addTest(); //solves issue of newly created test not showing up without refreshing the TestPage
            console.log(submitResponse);
            setSubmitToggle(false);
            const name1 = "/TestPage/" + deviceName
            if (!isDuplicateTest())
            navigate(name1)

        }
        submit();
    }

    const handleOrgChange = (newOrg) => {
        console.log("handleOrgChange called")
        setOrg(newOrg)
        console.log("org:", org)
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md">
                <h1 className="text-2xl font-bold mb-4">Create Test</h1>
                <form onSubmit={handleSubmit}>
                <div className="mb-4">
                        <EditOrgs
                            onOrgChange = {handleOrgChange}
                            inputString = ""/>
                </div>

                    <div className="mb-4">
                        <label htmlFor="testName" className="block font-bold">Test Name</label>
                        <input 
                            type="text"
                            id="testName"
                            name="testName"
                            value={testName}
                            onChange={handleTestNameChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="testMethod" className="block font-bold">Test Method</label>
                        <input 
                            type="text"
                            id="testMethod"
                            name="testMethod"
                            value={testMethod}
                            onChange={handleTestMethodChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="notes" className="block font-bold">Notes</label>
                        <input 
                            type="text"
                            id="notes"
                            name="notes"
                            value={notes}
                            onChange={handleNotesChange}
                            className="border rounded p-2 w-full"
                        />
                    </div>
                {!submitToggle ?
                    <button
                        type="submit"
                        className="m-2 px-4 rounded bg-sky-500 hover:bg-sky-700 text-white"
                    >
                        Submit
                    </button>
 
                :
                <Box sx ={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <CircularProgress/>
                </Box>
                }
                </form>
            </div>
        </div>
    );
};