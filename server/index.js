const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { findSongs, getSongs, getQueue, setQueue, shiftQueue, deleteFromQueue } = require('./song')
require('express-ws')(app, server)
const WebSocket = require('ws')
const bodyParser = require('body-parser')

const PORT = 8890

function setupServer() {
    
    app.use(bodyParser.json())
    app.use(require('cors')())

    let wsClients = []
    app.ws('/', socket => {
        console.log('ws conn')
        wsClients.push(socket)
        socket.on('message', msg => {
            console.log(msg)
            wsClients.map(client => client.readyState == 1 && client.send(msg.toString()))
            console.log(msg.toString())
        })
    })

    app.use('/videos', express.static('../songs'))

    app.get('/songs', async (req, res) => {
        res.send(await findSongs(req.query.search || ''))
    })

    app.get('/queue', async (req, res) => {
        res.send(await getQueue())
    })
    
    app.delete('/queue', async (req, res) => {
        res.send(await shiftQueue())
        wsClients.map(client => client.readyState == 1 && client.send('queue:shift'))
    })

    app.delete('/queue/:id', async (req, res) => {
        res.send(await deleteFromQueue(req.params.id))
        ws.send(`queue:delete:${req.params.id}`)
    })
    
    
    app.post('/queue', async (req, res) => {
        wsClients.map(client => client.readyState == 1 && client.send('queue:enqueue'))
        await setQueue(req.body)
        res.sendStatus(201)
    })
    
    let ws = null
    server.listen(PORT, () => {
        ws = new WebSocket(`ws://localhost:${PORT}`)
    })
}

async function start() {
    setupServer()
    console.log(`server started on localhost:${PORT}`)
    console.log('Indexing songs')
    console.time()
    await getSongs()
    console.timeEnd()
    console.log('Indexing done')
}

start()