const express = require('express');
const app = express();
const PORT = 10000;

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

// Serve the video embed page
app.get('/video', (req, res) => {
    const videoUrl = req.query.url;

    // Extract the video ID from the URL
    const videoIdMatch = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)|youtu\.be\/([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] || videoIdMatch[2] : null;

    if (!videoId) {
        return res.status(400).send('Invalid YouTube URL');
    }

    // Render an embedded YouTube player
    res.send(`
        <html>
            <body>
                <h1>Watch Video</h1>
                <iframe
                    width="800"
                    height="450"
                    src="https://www.youtube.com/embed/${videoId}"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
                <br>
                <a href="/">Go Back</a>
            </body>
        </html>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
