import { createContext } from "react";

// Create the context
export const ClientListContext = createContext({
    clientList: {},
    handleClientChange: () => {},
});
