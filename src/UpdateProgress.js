
import { vendiaClient } from "./vendiaClient";

const { client } = vendiaClient();
export var status;
export const UpdateProgress = async(deviceName) => {
    
    try{
        // Add a small delay (e.g., 1000ms) for testing purposes
        //await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("timeout1 complete")
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
        console.log("Comp Tests:",listCompTestResponse)
        // Add a small delay (e.g., 1000ms) for testing purposes
        //await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("timeout2 complete")
        //Next calculate the total percent and round that num
        var total = (listCompTestResponse.items.length/listTotalTestResponse.items.length) * 100;
        console.log("Total:", total)
        var rounded = Math.round(total);
        console.log("Rounded:", rounded)
        console.log(listDeviceResponse.items[0]._id)

        //Finally store that num in device progress
        if(rounded === 100)
            status = "Inactive"
        else
            status = "Active"
        const progressResponse = await client.entities.device.update({
            _id: listDeviceResponse.items[0]._id,
            Progress: rounded,
            Status: status,
        })
    } catch (error) {
        console.log("Error is: ", error);
      }
      
};

export default UpdateProgress;