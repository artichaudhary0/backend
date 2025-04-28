const express = require('express');
const {
  addHabit, getHabits, updateHabit, deleteHabit, checkInHabit
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

 router.use(protect);
router.post('/', addHabit);
router.get('/', getHabits);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/checkin/:id', checkInHabit);

module.exports = router;
