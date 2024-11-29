// Import required modules
const express = require('express');
const ytdl = require('ytdl-core');

// Initialize the express app
const app = express();
const PORT = 10000;

// Route to stream YouTube video and audio
app.get('/stream', async (req, res) => {
    const videoUrl = req.query.url;

    // Validate YouTube URL
    if (!ytdl.validateURL(videoUrl)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        // Get video info
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title;

        // Set response headers
        res.setHeader('Content-Disposition', `inline; filename="${title}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');

        // Stream video and audio
        ytdl(videoUrl, { quality: 'highest' }).pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing the video');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});