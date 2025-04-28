const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
require('dotenv').config();

exports.protect = catchAsync(async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Get token from "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ msg: 'Token is required' });
  }

  try {
    // Verify token and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use JWT_SECRET from the .env file

    req.user = decoded; // Attach decoded token (user data) to the request object

    // Now fetch the user from DB and handle errors if user is not found
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User no longer exists', 404));
    }

    req.user = user; // Overwrite req.user with the full user data from DB
    next();
  } catch (error) {
    // Handle token errors (expired or invalid)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token expired, please log in again' });
    }
    return res.status(401).json({ msg: 'Token is invalid' });
  }
});
