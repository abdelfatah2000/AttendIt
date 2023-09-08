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
  },
  {
    timestamps: true,
  }
);
