import React from 'react';


const LayoutContext = React.createContext({
    data: {
        country: "G",
        date: "D"
    },
    setData: () => {}
});
export default LayoutContext;