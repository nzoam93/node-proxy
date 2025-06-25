import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  "https://nzoam93.github.io", // my app I am trying to access from
  'http://127.0.0.1:5500',
  '127.0.0.1:5501',
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
    // Build query with quality and type filters
    const query = `${bird} q:A type:song`;
    const apiUrl = `https://www.xeno-canto.org/api/2/recordings?query=${encodeURIComponent(query)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Filter for recordings with 'A' quality and type 'song' just in case
    const recordings = (data.recordings || []).filter(
      r => r.q === 'A' && r.type === 'song'
    );

    if (recordings.length > 0) {
      let fileUrl = recordings[0].file;
      if (!fileUrl.startsWith('http')) {
        fileUrl = `https:${fileUrl}`;
      }
      return res.json({ url: fileUrl });
    } else {
      return res.status(404).json({ error: 'No high-quality bird song recordings found' });
    }
  } catch (error) {
    console.error('Error fetching bird sound:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Secure proxy running on port ${PORT}`);
});
