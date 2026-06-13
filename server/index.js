// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/issues', require('./routes/issues'));

// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected');
//     app.listen(process.env.PORT || 5000, () => console.log('Server running on port 5000'));
//   })
//   .catch(err => console.log(err));


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL  // will add this after deploy
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));

// Health check — Render needs this
app.get('/', (req, res) => {
  res.json({ message: 'Civic Issue Reporter API is running' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log('Server running on port', process.env.PORT || 5000)
    );
  })
  .catch(err => console.log(err));