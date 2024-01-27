import { createVendiaClient } from "@vendia/client";

const client = createVendiaClient({
  apiUrl: `https://kakcytvpqi.execute-api.us-west-2.amazonaws.com/graphql/`,
  apiKey: '6yNWqXbU6pyh7FcTYcsASVHKz7FvGr7Mt64PACUXyLB2', // <---- API key
  })

  export const vendiaClient = () => {
    return {client};
  };