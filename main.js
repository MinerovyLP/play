const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 10000;

// Homepage for inputting YouTube video URLs
app.get('/', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>YouTube Embed Proxy</h1>
                <form action="/embed" method="get">
                    <label for="url">YouTube Video URL:</label>
                    <input type="text" id="url" name="url" placeholder="Enter YouTube link" required>
                    <button type="submit">Access Video</button>
                </form>
            </body>
        </html>
    `);
});

// Proxy the YouTube embed page
app.get('/embed', async (req, res) => {
    const videoUrl = req.query.url;

    // Extract video ID from the URL
    const videoIdMatch = videoUrl.match(/(?:v=|youtu\.be\/)([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        // Fetch the YouTube embed page
        const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
        const response = await axios.get(youtubeEmbedUrl, { responseType: 'text' });

        // Serve the fetched content to the client
        res.setHeader('Content-Type', 'text/html');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching YouTube embed page:', error.message);
        res.status(500).send('Could not fetch the embed page.');
    }
});

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).send('Search query is required');
    }

    try {
        const response = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
        const $ = cheerio.load(response.data);

        const results = [];
        $('a#video-title').each((index, element) => {
            const title = $(element).text().trim();
            const link = `https://www.youtube.com${$(element).attr('href')}`;
            results.push({ title, link });
        });

        res.json(results);
    } catch (error) {
        console.error('Error fetching search results:', error.message);
        res.status(500).send('Could not fetch search results.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
