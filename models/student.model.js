const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      match: /^01[0125][0-9]{8}$/,
      unique: true,
    },
    parent: {
      type: String,
      required: true,
      match: /^01[0125][0-9]{8}$/,
    },
    level: {
      type: String,
      default: 'Third',
      enum: ['First', 'Second', 'Third'],
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
      required: true,
      minimum: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
