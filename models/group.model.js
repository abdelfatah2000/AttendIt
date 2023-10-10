const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    start: {
      type: Number,
      required: true,
    },
    end: {
      type: Number,
      required: true,
    },
    level: {
      type: String,
      default: 'Third',
      enum: ['First', 'Second', 'Third'],
    },
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Group', groupSchema);
