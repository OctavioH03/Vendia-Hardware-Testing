import { vendiaClient } from "./vendiaClient"
import { UpdateProgress} from "./UpdateProgress"
const { client } = vendiaClient();

export const DeleteTests = (selectedTests, {listTestToggle, setListTestToggle}) => {
    for (let i = 0; i < selectedTests.length; i++){
        const removeTest = async () => {
            const id = selectedTests[i]
            console.log(id)
            const getDeviceName = await client.entities.test.get(id);
            console.log(getDeviceName.Device)
            const deleteTestResponse = await client.entities.test.remove(id, { syncMode: 'NODE_LEDGERED'});
            await UpdateProgress(getDeviceName.Device)
            console.log(deleteTestResponse);
            //await UpdateProgress(client.entities.test[id]._id)
        }
        // removeTest();
        const toggle = async() => {
            const toggleResponse = await removeTest()
            console.log(toggleResponse)
            setListTestToggle(!listTestToggle);
        }
        toggle();
    }
}