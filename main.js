const https = require('https');
const express = require('express');
const app = express();

app.get('/stream', (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Missing YouTube URL');
    }

    https.get(videoUrl, (youtubeRes) => {
        // Forward headers
        res.setHeader('Content-Type', youtubeRes.headers['content-type']);
        res.setHeader('Content-Length', youtubeRes.headers['content-length']);

        // Pipe the video to the client
        youtubeRes.pipe(res);
    }).on('error', (err) => {
        console.error('Error fetching video:', err);
        res.status(500).send('Failed to stream video');
    });
});

app.listen(10000, () => {
    console.log('Server running at http://localhost:3000');
});
