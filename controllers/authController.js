const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { signupSchema, loginSchema } = require('../validators/authValidator');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/responseHandler');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { error } = signupSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const { username, email, password } = req.body;
  const user = await User.create({ username, email, password });

  const token = createToken(user._id);
  success(res, { user, token }, 'User registered successfully', 201);
});



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = createToken(user._id);


    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    });

    success(res, { user: { _id: user._id, name: user.name, email: user.email } }, 'Login successful', 200);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.logout = (req, res) => {
  try {
    // Clear the authentication token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensure it's secure in production
      sameSite: 'strict', // Optional: set SameSite to 'strict' for better security
    });

    // Respond with a success message
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
