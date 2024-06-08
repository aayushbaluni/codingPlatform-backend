// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./db');
const userRoutes = require('./routes/userRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const { authenticate } = require('./middleware/authMiddleware');

app.use(express.json());
app.use('/users', userRoutes);
app.use('/problems', authenticate, problemRoutes);
app.use('/submissions', authenticate, submissionRoutes);

const PORT = process.env.PORT || 5100;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
