const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const index=require('./routes/index')
const errorMiddleware = require('./middleware/errorMiddleware');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
const corsOptions = {
    origin: 'http://localhost:5173', // Allow only your frontend URL
    credentials: true,  // Allow credentials like cookies to be sent
  };
  
app.use(cors(corsOptions));
app.use(express.json());

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/habits', habitRoutes);
app.use('/api',index)

// Error Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
