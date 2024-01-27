import { auth } from "./firebase-config";
import { vendiaClient } from "./vendiaClient";

const { client } = vendiaClient();
export const MarkTestsComplete = (selectedTests, {listTestToggle, setListTestToggle}) => {
    for (let i = 0; i < selectedTests.length; i++){
        const markTestComplete = async () => {
            const getTestResponse = await client.entities.test.get(selectedTests[i]); 
            if(getTestResponse?.Completed === true){
                i++;
            }
            if(i < selectedTests.length){
                const markTestCompleteResponse = await client.entities.test.update({
                    _id: selectedTests[i],
                    Completed: true,
                    UpdatedBy: auth.currentUser.email
                })
                console.log(markTestCompleteResponse);
            }
        }
        // markTestComplete();
        const toggle = async() => {
            const toggleResponse = await markTestComplete();
            // console.log(toggleResponse);
            setListTestToggle(!listTestToggle);
        }
        toggle();
    }
}