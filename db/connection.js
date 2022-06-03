const mysql = require("mysql2");

//connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        //Your MySql username,
        user: 'dbuser',
        //Your MySQL password
        password: 'dbuser',
        database: 'election'
    },
    console.log('Connected to election database.')
)

module.exports = db;