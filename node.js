const express = require('express');

const app = express();
app.use(express.static('./'));

let buffer = [1,2,3,4];

process
    .stdin
    .on('data', (chunk) => {
        let str = chunk.toString();
        console.log(eval(str));
    });
function sseDemo(req, res) {

    const intervalId = setInterval(() => {
        if (buffer.length) {
            const message = buffer.shift();
            console.log(`data: Test Message -- ${message}\n\n`);
            res.write(`data: Test Message -- ${message}\n\n`);
        } else {
            res.end();
        }
    }, 5000);

    req.on('close', () => {
        console.log('connection closed');
        clearInterval(intervalId);
    });
}

app.get('/event-stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    sseDemo(req, res);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(3000);