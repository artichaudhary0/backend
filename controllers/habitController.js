const Habit = require('../models/Habit');
const { habitSchema } = require('../validators/habitValidator');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/responseHandler');

/**
 * Create a new habit
 * @route POST /api/habit
 */
exports.addHabit = catchAsync(async (req, res, next) => {
  try {
    console.log("Received habit data:", req.body);
    console.log("User ID from auth:", req.user?._id);
    
    // Validate the habit data
    const { error } = habitSchema.validate(req.body);
    if (error) {
      console.error("Validation error:", error.details);
      return next(new AppError(error.details[0].message, 400));
    }
    
    // Prepare habit data with user ID
    const habitData = { 
      habitName: req.body.habitName,
      targetDays: req.body.targetDays,
      startDate: new Date(req.body.startDate),
      user: req.user._id,
      checkIns: [],
      currentStreak: 0,
      longestStreak: 0
    };
    
    console.log("Creating habit with data:", habitData);
    
    // Create a new habit in the database
    const habit = await Habit.create(habitData);
    console.log("Habit created successfully:", habit);
    
    // Respond with the created habit
    success(res, habit, 'Habit created successfully', 201);
  } catch (error) {
    console.error("Error in addHabit controller:", error);
    return next(new AppError(`Failed to create habit: ${error.message}`, 500));
  }
});

/**
 * Get all habits for the authenticated user
 * @route GET /api/habit
 */
exports.getHabits = catchAsync(async (req, res, next) => {
  try {
    console.log("Fetching habits for user:", req.user?._id);
    
    const habits = await Habit.find({ user: req.user._id });
    console.log(`Found ${habits.length} habits for user`);
    
    success(res, habits, 'Habits retrieved successfully');
  } catch (error) {
    console.error("Error in getHabits controller:", error);
    return next(new AppError(`Failed to fetch habits: ${error.message}`, 500));
  }
});

/**
 * Update a habit
 * @route PUT /api/habit/:id
 */
exports.updateHabit = catchAsync(async (req, res, next) => {
  try {
    console.log("Updating habit:", req.params.id);
    console.log("Update data:", req.body);
    
    // Validate update data if needed
    if (Object.keys(req.body).length > 0) {
      const { error } = habitSchema.validate(req.body, { allowUnknown: true });
      if (error) {
        console.error("Validation error on update:", error.details);
        return next(new AppError(error.details[0].message, 400));
      }
    }
    
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!habit) {
      console.log("Habit not found or not owned by user");
      return next(new AppError('Habit not found', 404));
    }
    
    console.log("Habit updated successfully:", habit);
    success(res, habit, 'Habit updated successfully');
  } catch (error) {
    console.error("Error in updateHabit controller:", error);
    return next(new AppError(`Failed to update habit: ${error.message}`, 500));
  }
});

/**
 * Delete a habit
 * @route DELETE /api/habit/:id
 */
exports.deleteHabit = catchAsync(async (req, res, next) => {
  try {
    console.log("Deleting habit:", req.params.id);
    
    const habit = await Habit.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!habit) {
      console.log("Habit not found or not owned by user");
      return next(new AppError('Habit not found', 404));
    }
    
    console.log("Habit deleted successfully");
    success(res, null, 'Habit deleted successfully');
  } catch (error) {
    console.error("Error in deleteHabit controller:", error);
    return next(new AppError(`Failed to delete habit: ${error.message}`, 500));
  }
});

/**
 * Record a check-in for a habit
 * @route POST /api/habit/checkin/:id
 */
exports.checkInHabit = catchAsync(async (req, res, next) => {
  try {
    console.log("Check-in for habit:", req.params.id);
    console.log("Check-in data:", req.body);
    
    const { status } = req.body;
    if (!status || !['completed', 'missed'].includes(status)) {
      return next(new AppError('Check-in status must be "completed" or "missed"', 400));
    }
    
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!habit) {
      console.log("Habit not found or not owned by user");
      return next(new AppError('Habit not found', 404));
    }
    
    const today = new Date().toDateString();
    const existingCheckIn = habit.checkIns.find(
      ci => new Date(ci.date).toDateString() === today
    );
    
    if (existingCheckIn) {
      console.log("Updating existing check-in for today");
      existingCheckIn.status = status;
    } else {
      console.log("Adding new check-in for today");
      habit.checkIns.push({ date: new Date(), status });
    }
    
    // Calculate streaks
    const sorted = habit.checkIns.sort((a, b) => new Date(a.date) - new Date(b.date));
    let currentStreak = 0, longestStreak = 0;
    
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].status === 'completed') {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    habit.currentStreak = currentStreak;
    habit.longestStreak = longestStreak;
    
    await habit.save();
    console.log("Habit check-in recorded successfully");
    
    success(res, habit, 'Habit check-in updated');
  } catch (error) {
    console.error("Error in checkInHabit controller:", error);
    return next(new AppError(`Failed to check-in habit: ${error.message}`, 500));
  }
});

/**
 * Get habit details
 * @route GET /api/habit/:id
 */
exports.getHabitById = catchAsync(async (req, res, next) => {
  try {
    console.log("Fetching habit details:", req.params.id);
    
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!habit) {
      console.log("Habit not found or not owned by user");
      return next(new AppError('Habit not found', 404));
    }
    
    console.log("Habit found:", habit);
    success(res, habit, 'Habit details retrieved successfully');
  } catch (error) {
    console.error("Error in getHabitById controller:", error);
    return next(new AppError(`Failed to fetch habit details: ${error.message}`, 500));
  }
});