const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'web')))

app.get('/getTeams', async (req, res) => {
    res.sendFile(path.join(__dirname + '/data/teams.json'));
});

app.get('/getResult', async (req, res) => {
    res.sendFile(path.join(__dirname + '/data/result.json'));
})

app.get('/getRanking', async(req, res) => {
    res.sendFile(path.join(__dirname, '/data/final.json'));
})

app.listen(8413)