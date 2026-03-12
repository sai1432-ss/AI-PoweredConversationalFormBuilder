const express = require('express');
const cors = require('cors');
require('dotenv').config();
const formRoutes = require('./formRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Main API Route
app.use('/api/form', formRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('OK Healthy!!');
});

// Ensure your app is listening on 8080 as per your compose file
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));