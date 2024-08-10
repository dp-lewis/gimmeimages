import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Use __dirname and __filename in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the JSON file
const data = JSON.parse(fs.readFileSync(new URL((process.argv[2] || './exports/images.json'), import.meta.url), 'utf8'));

// Create a directory to save the images
const downloadDir = path.join(__dirname, 'downloaded_images');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

// Function to download an image
const downloadImage = async (url, filename) => {
  const filePath = path.join(downloadDir, filename);
  const writer = fs.createWriteStream(filePath);

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
  }
};

// Loop over the array of URLs and download each image
const downloadImages = async () => {
  for (const url of data) {
    const filename = path.basename(url);
    await downloadImage(url, filename);
    console.log(`Downloaded: ${filename}`);
  }
};

downloadImages().then(() => {
  console.log('All images have been downloaded.');
});
