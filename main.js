const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const puppeteer = require('puppeteer');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve a simple client interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Browser Controller</title>
    </head>
    <body>
      <h1>Browser Control Interface</h1>
      <input type="text" id="url" placeholder="Enter URL" />
      <button onclick="navigate()">Go</button>
      <br><br>
      <iframe id="browser" style="width: 100%; height: 600px; border: 1px solid #ccc;"></iframe>
      <script src="/socket.io/socket.io.js"></script>
      <script>
        const socket = io();

        function navigate() {
          const url = document.getElementById('url').value;
          socket.emit('navigate', url);
        }

        socket.on('update', (html) => {
          const iframe = document.getElementById('browser');
          iframe.srcdoc = html;
        });
      </script>
    </body>
    </html>
  `);
});

// Start Puppeteer and browser control
let browser, page;

(async () => {
  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();

  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('navigate', async (url) => {
      try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        const content = await page.content();
        socket.emit('update', content); // Send rendered page HTML to the client
      } catch (error) {
        console.error('Navigation error:', error);
        socket.emit('update', `<h1>Error navigating to ${url}</h1><p>${error.message}</p>`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
})();

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

