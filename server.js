const mysql = require("mysql2");
const express = require('express');
const { rootCertificates } = require("tls");
const res = require("express/lib/response");
const inputCheck = require('./utils/inputCheck');
const PORT = process.env.PORT || 3001;
const app = express();

//Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

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


/*
We chose the route method get() and the response method res.json() to send the 
response message "Hello World!" back to the client.
*/
app.get('/', (req, res) => {
    res.json({
        message: "Hello World!"
    });
});

//      <==CANDIDATES==>
// All candidates with party name
app.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name  AS party_name
                FROM candidates  
                LEFT JOIN parties  
                ON candidates.party_id = parties.id;`

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: rows
        });
    });
});

//Get a single candidate
app.get('/api/candidate/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name 
                AS party_name 
                FROM candidates 
                LEFT JOIN parties 
                ON candidates.party_id = parties.id 
                WHERE candidates.id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

//Delete Candidate
app.delete('/api/candidate/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err, result) => {
        if (err) {
            res.statusMessage(400).json({ error: res.message });
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found!'
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});


//Create Candidate
app.post('/api/candidate', ({ body }, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }
    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
    VALUES(?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];
    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: body
        });
    });
});

//      <==PARTIES==>
//All Parties
app.get('/api/parties', (req, res) => {
    const sql = `SELECT * FROM parties`;
    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

//Select single party
app.get('/api/party/:id', (req, res) => {
    const sql = `SELECT * FROM parties where id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: row
        });
    });
});

//delete one row from party tbl
app.delete('/api/party/:id', (req, res) => {
    const sql = `DELETE FROM parties WHERE id = ?`;
    const params = [req.params.id];
    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: res.message });
            //checks if anything was deleted
        } else if (!result.affectedRows) {
            res.json({
                message: "Party not found!"
            });
        } else {
            res.json({
                message: 'deleted',
                changes: result.affectedRows,
                id: req.params.id
            });
        }
    });
});


//Update a candidate's party
app.put('/api/candidate/:id', (req, res) => {
    /*Candidate is allowed to not have party affiliation
    This now forces any PUT request to /api/candidate/:id to include a party_id property. 
    Even if the intention is to remove a party affiliation by setting it to null, the party_id property is still required.
    */
    const errors = inputCheck(req.body,'party_id');
    if(errors){
        res.status(400).json({error:errors});
        return;
    }
    const sql = `UPDATE candidates SET party_id =?
    WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];
    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message });
            //check if a record was found
        } else if (!result.affectedRows) {
            res.json({
                message: 'Candidate not found!'
            });
        } else {
            res.json({
                message: 'success',
                data: req.body,
                changes: result.affectedRows
            });
        }
    });
});


//Default response for any other requests not found <-- placement is critical. Is a catchall so make sure it in on the bottom
app.use((req, res) => {
    res.status(404).end();
})

//Start Express on port 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
