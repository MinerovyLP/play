const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const app = express();
const port = 3000;

// Helper function to download files
async function downloadFile(url, dest) {
  const response = await fetch(url);
  const fileStream = fs.createWriteStream(dest);
  await new Promise((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
  console.log(`Downloaded ${url} to ${dest}`);
}

// Function to convert a downloaded file to 7z
async function convertTo7z(inputFilePath, outputFilePath) {
  try {
    const command = `7za a "${outputFilePath}" "${inputFilePath}"`;  // 7z compression command
    const { stdout, stderr } = await exec(command);
    if (stderr) {
      throw new Error(stderr);
    }
    console.log(`File successfully compressed to 7z: ${stdout}`);
  } catch (error) {
    console.error(`Error during compression: ${error.message}`);
  }
}

// API endpoint to download and convert the file
app.get('/download-convert', async (req, res) => {
  const fileUrl = req.query.url;  // File URL to download
  const tempDir = path.join(__dirname, 'temp');
  const inputFilePath = path.join(tempDir, 'downloadedFile');
  const outputFilePath = path.join(tempDir, 'compressedFile.7z');

  try {
    if (!fileUrl) {
      return res.status(400).send('URL parameter is required');
    }

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Step 1: Download the file
    await downloadFile(fileUrl, inputFilePath);

    // Step 2: Convert to 7z
    await convertTo7z(inputFilePath, outputFilePath);

    // Step 3: Send the 7z file as a response to the client
    res.download(outputFilePath, 'convertedFile.7z', (err) => {
      if (err) {
        console.error(`Error during file download: ${err.message}`);
      }
      // Clean up files after download
      fs.unlinkSync(inputFilePath);
      fs.unlinkSync(outputFilePath);
    });
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
