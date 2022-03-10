const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const app = express();
const client = require('../src/redis.js')
const port = 8080;

app.listen(port, () =>{
    console.log(`App listen on port ${port}`)
})

app.use(express.json())

app.post('/create', async (req,res) => {
    try {
        await client.connect();
        const student = req.body;
        for (const key in student) {
            await client.hSetNX(student.codigo,key, student[key]);
        }
        res.send(student)
    } catch (error) {
        res.send(error)
    }
    await client.disconnect();
});

app.get('/user', async (req,res) => {
    const codigo = req.query.codigo;
    let result = [];
    await client.connect();
    if(typeof codigo === 'undefined'){
        for (const element of await client.keys('*')) {
            result.push(await client.hGetAll(`${element}`));
        }
    }else{
        result = await client.hGetAll(`${codigo}`);
    }
    await client.disconnect();
    res.send(result)
})

app.put('/update', async (req, res) => {
    const student = req.body;
    await client.connect();
    if(await client.hExists(student.codigo) == false){
        for (const key in student) {
            await client.hSet(student.codigo,key, student[key]);
        }
        res.send(student)
    }
    await client.disconnect();
})

app.delete('/delete', async (req, res) =>{
    await client.connect();
    const codigo = req.query.codigo;
    try {
        const student = await client.hGetAll(`${codigo}`);
        await client.del(`${codigo}`);
        res.send(student);
    } catch (error) {
        res.send(error)
    }
    await client.disconnect();
})


// http://localhost:8080/delete?codigo=20161020091

// http://localhost:8080/user

// http://localhost:8080/create

// http://localhost:8080/update