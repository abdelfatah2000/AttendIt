const Attendance = require('../models/attendance.model');
const Student = require('../models/student.model');

const sendMessage = (arr) => {
  arr.forEach((element) => {});
};

exports.getTakeAttendance = (req, res, next) => {
  res.render('take-attendance', {
    path: '/take-attendance',
    pageTitle: 'Take Attendance',
  });
};

exports.postTakeAttendance = (req, res, next) => {
  console.log(req.body);
  const groupID = req.body.group;
  const students = req.body.students;
  // const attendance = new Attendance({
  //   group: groupID,
  //   students,
  // });
  // attendance.save().then(() => {
  //   students.forEach((element) => {
  //     Student.findByIdAndUpdate(element.studentId, {
  //       $inc: { balance: -1 },
  //     })
  //       .then(() => {})
  //       .catch((err) => {
  //         const error = new Error(err);
  //         error.httpStatusCode = 500;
  //         return next(error);
  //       });
  //   });
  //   console.log('Attendance Created');
  //   res.status(200).json('Attendace Done');
  // });
  // .catch((err) => {
  //   const error = new Error(err);
  //   error.httpStatusCode = 500;
  //   return next(error);
  // });

  console.log('Attendance Created');
  res.status(200).json('Attendace Done');
};

exports.getViewAttendance = (req, res, next) => {
  res.render('view-attendance', {
    path: '/view-attendance',
    pageTitle: 'View Attendance',
  });
};

exports.getGroupAttendance = (req, res, next) => {
  const arr = [];
  const groupID = req.body.groupID;
  Attendance.find({ group: groupID })
    .then((result) => {
      result.forEach((item) => {
        arr.push({
          _id: item._id,
          group: item.group,
          studentsNumber: item.students.length,
          createdAt: item.createdAt.toLocaleDateString('en-us', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        });
      });
      res.status(200).json(arr);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAttendanceStudent = (req, res, next) => {
  const attendanceID = req.params.id;
  Attendance.findById(attendanceID)
    .populate({ path: 'students.studentId' })
    .populate({ path: 'students.attendanceGroup' })
    .then((result) => {
      res.render('view-attendance-students', {
        pageTitle: 'View Attendance Students',
        path: '/view-attendance',
        attendance: result,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getStudentAttendance = (req, res, next) => {
  const studentID = req.body.studentID;
  let arr = [],
    temp;
  Student.findById(studentID).then((student) => {
    Attendance.aggregate([
      {
        $lookup: {
          from: 'groups',
          localField: 'group',
          foreignField: '_id',
          as: 'group',
        },
      },
      { $unwind: { path: '$group', preserveNullAndEmptyArrays: true } },
      {
        $match: { 'group.level': student.level },
      },
      { $unwind: { path: '$students' } },
      {
        $lookup: {
          from: 'groups',
          localField: 'students.attendanceGroup',
          foreignField: '_id',
          as: 'students.attendanceGroup',
        },
      },
      {
        $addFields: {
          'students.attendanceGroup': {
            $ifNull: [{ $arrayElemAt: ['$students.attendanceGroup', 0] }, ''],
          },
        },
      },
      {
        $project: {
          _id: 1,
          'group._id': 1,
          'group.level': 1,
          'group.name': 1,
          'students.studentId': 1,
          'students._id': 1,
          'students.attendanceAt': 1,
          'students.attendanceGroup._id': 1,
          'students.attendanceGroup.name': 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      {
        $group: {
          _id: '$_id',
          group: { $first: '$group' },
          students: { $push: '$students' },
          createdAt: { $first: '$createdAt' },
        },
      },
    ]).then((result) => {
      result.forEach((items) => {
        temp = items.students.find((ele) => ele.studentId == studentID);
        if (temp) {
          arr.push({
            status: 'present',
            time: temp.attendanceAt.toTimeString().split(' ')[0],
            group: temp.attendanceGroup.name,
            createdAt: items.createdAt.toLocaleDateString('en-us', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          });
        } else {
          arr.push({
            status: 'absence',
            createdAt: items.createdAt.toLocaleDateString('en-us', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          });
        }
      });
      res.json(arr);
    });
  });
};
