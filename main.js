const express = require('express');
const ytdl = require('ytdl-core');

const app = express();
const PORT = 10000;

// Route to handle YouTube video streaming
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('Error: URL parameter is required');
    }

    try {
        // Validate if the URL is a valid YouTube link
        if (!ytdl.validateURL(videoUrl)) {
            return res.status(400).send('Error: Invalid YouTube URL');
        }

        // Get video info (optional but useful for headers)
        const videoInfo = await ytdl.getInfo(videoUrl);
        const videoTitle = videoInfo.videoDetails.title;

        // Set response headers
        res.setHeader('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');

        // Stream video to the user
        ytdl(videoUrl, { quality: 'highestvideo' }).pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: Unable to process the video');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
