const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ['completed', 'missed'], required: true }
}, { _id: false });

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  habitName: { type: String, required: true },
  targetDays: [{ type: String, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] }],
  startDate: { type: Date, default: Date.now },
  checkIns: [checkInSchema],
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
