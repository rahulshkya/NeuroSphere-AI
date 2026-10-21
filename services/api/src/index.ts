import express from 'express';

const app = express();
const PORT = 4000;

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok service is running', service: 'api' });
});

app.listen(PORT, () => {
  console.log(`API service is running on port ${PORT}`);
});
