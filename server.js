const express = require('express');
const PORT = process.env.PORT||3001;
const app = express();

//Express middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//Start Express on port 3001
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`); 
});

/*
We chose the route method get() and the response method res.json() to send the 
response message "Hello World!" back to the client.
*/
app.get('/',(req,res)=>{
    res.json({
        message:"Hello World!"
    });
});
