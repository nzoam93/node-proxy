import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  "https://nzoam93.github.io/birdle-revamped/", // my app I am trying to access from
  'http://127.0.0.1:5500'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/bird-sound', async (req, res) => {
  const { bird } = req.query;
  if (!bird) {
    return res.status(400).json({ error: 'Missing bird query parameter' });
  }

  try {
    const response = await fetch(`https://www.xeno-canto.org/api/2/recordings?query=${encodeURIComponent(bird)}`);
    const data = await response.json();

    if (data.recordings && data.recordings.length > 0) {
      let fileUrl = data.recordings[0].file;
      console.log('fileurl', fileUrl);
      console.log('data', data)
      if (!fileUrl.startsWith('http')) {
        fileUrl = `https:${fileUrl}`;
      }
      return res.json({ url: fileUrl });
    } else {
      return res.status(404).json({ error: 'No recordings found' });
    }
  } catch (error) {
    console.error('Error fetching bird sound:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Secure proxy running on port ${PORT}`);
});
