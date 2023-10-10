const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    students: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
          required: true,
        },
        attendanceAt: {
          type: Date,
          default: Date.now(),
        },
        attendanceGroup: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Group',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
