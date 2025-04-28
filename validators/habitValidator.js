const Joi = require('joi');

exports.habitSchema = Joi.object({
  habitName: Joi.string().required(),
  targetDays: Joi.array().items(
    Joi.string().valid('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
  ).required(),
  startDate: Joi.date().optional()
});
