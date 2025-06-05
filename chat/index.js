const http = require("http");
const url = require('url');
const WebSocketServer = require("websocket").server
const PORT = process.argv[2] || 8080;
let connection = null;

//create a raw http server (this will help us create the TCP which will then pass to the websocket to do the job)
const httpserver = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Routing logic just so a page opens
    if (parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Hello World from nodeapp running on port ${PORT}!`);
    }
});

 //pass the httpserver object to the WebSocketServer library to do all the job, this class will override the req/res
const websocket = new WebSocketServer({
    "httpServer": httpserver
})

httpserver.listen(PORT, () => console.log(`My server is listening on port ${PORT}`))

//when a legit websocket request comes listen to it and get the connection .. once you get a connection thats it!
websocket.on("request", request=> {

    connection = request.accept(null, request.origin)
    connection.on("close", () => console.log("CLOSED!!!"))
    connection.on("message", message => {

        console.log(`Received message ${message.utf8Data}`)
        connection.send(`Server ${PORT} responded to your message: ${message.utf8Data}`)
    })
})

/* node server run (on host)
node index.js 2222 & node index.js 3333 & node index.js 4444
*/

/* nginx server run (on docker)
podman compose up -d ng0 --force-recreate
podman exec ng0 nginx -s reload
*/

/* client code for L4
let ws = new WebSocket("ws://localhost:8888");
ws.onmessage = message => console.log(`Received: ${message.data}`);
ws.send("Hello! I'm client")
*/

/* client code for L7
let ws = new WebSocket("ws://localhost:8888/wsapp");
let ws2 = new WebSocket("ws://localhost:8888/wschat");
ws.onmessage = message => console.log(`Received: ${message.data}`);
ws2.onmessage = message => console.log(`Received: ${message.data}`);
ws.send("Hello! I'm client on /wsapp")
ws2.send("Hello! I'm client on /wschat")
*/