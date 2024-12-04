const express = require('express');
const ytdl = require('ytdl-core');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve the homepage
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>YouTube Video Player</h1>
                <form action="/video" method="get">
                    <label for="url">YouTube Video URL:</label>
                    <input type="text" id="url" name="url" placeholder="Enter YouTube link" required>
                    <button type="submit">Get Video</button>
                </form>
            </body>
        </html>
    `);
});

// Fetch and stream the video
app.get('/video', async (req, res) => {
    const videoUrl = req.query.url;

    if (!ytdl.validateURL(videoUrl)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        const videoInfo = await ytdl.getInfo(videoUrl);
        const videoTitle = videoInfo.videoDetails.title;

        res.setHeader('Content-Disposition', `inline; filename="${videoTitle}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');

        ytdl(videoUrl, { format: 'mp4' }).pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing the video.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
