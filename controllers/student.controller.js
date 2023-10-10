const Student = require('../models/student.model');
const Group = require('../models/group.model');
const { validationResult } = require('express-validator');
const { Canvas } = require('canvas');
const JsBarcode = require('jsbarcode');
const moment = require('moment');

const convertSecondsToTime = (seconds) => {
  let time = new Date(seconds * 1000).toISOString().substring(11, 16);
  time = moment(time, 'HH:mm').format('hh:mm a');
  return time;
};

const generateBarCode = (id) => {
  const canvas = new Canvas();
  JsBarcode(canvas, id, {
    lineColor: '#000',
    width: 2,
    height: 100,
    displayValue: true,
  });
  canvas.toDataURL('image/png', (err, png) => {
    return png;
  });
};

const days = [
  '',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

exports.getAddStudent = (req, res, next) => {
  res.render('add-student', {
    path: '/add-student',
    pageTitle: 'Add Student',
    hasError: false,
    data: '',
    validationErrors: [],
  });
};

exports.postAddStudent = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors.mapped());
  if (!errors.isEmpty()) {
    // return res.status(400).render('add-student', {
    //   path: '/add-student',
    //   pageTitle: 'Add Student',
    //   hasError: true,
    //   student: {
    //     name: req.body.name,
    //     phone: req.body.phone,
    //     parent: req.body.parent,
    //     level: req.body.level,
    //     group: req.body.group,
    //     balance: req.body.balance,
    //   },
    //   errors: errors.mapped(),
    //   validationErrors: errors.array(),
    // });

    return res.status(400).json(errors);
  }
  const student = new Student({
    name: req.body.name,
    phone: req.body.phone,
    parent: req.body.parent,
    level: req.body.level,
    group: req.body.group,
    balance: req.body.balance,
  });
  student
    .save()
    .then((result) => {
      console.log('Student Created');
      res.json(generateBarCode(result._id));
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getManageStudent = (req, res, next) => {
  const level = req.params.level;
  Student.find({ level })
    .populate('group')
    .then((students) => {
      res.render('view-students', {
        path: `/view-students/${level}`,
        students,
        pageTitle: `${level} Level Students`,
        hasError: false,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteStudent = (req, res, next) => {
  const id = req.body.studentId;
  Student.findByIdAndDelete(id).then((result) => {
    console.log('Student Deleted');
    res.redirect(`/view-students/${result.level}`);
  });
};

exports.getEditStudent = (req, res, next) => {
  Student.findById(req.params.studentId)
    .then((student) => {
      console.log(student)
      Group.find({ level: student.level })
        .then((groups) => {
          let arr = [];
          groups.forEach((item) => {
            arr.push({
              _id: item._id,
              name: item.name,
              start: convertSecondsToTime(item.start),
              end: convertSecondsToTime(item.end),
              day: days[item.day],
            });
          });
          res.render('edit-student', {
            path: `/view-students/${student.level}`,
            student,
            groups: arr,
            pageTitle: 'Edit Student',
            validationErrors: [],
          });
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
//     .catch((err) => {
//       const error = new Error(err);
//       error.httpStatusCode = 500;
//       return next(error);
//     });
};

exports.postEditStudent = (req, res, next) => {
  const studentId = req.body.studentId;
  const name = req.body.name;
  const phone = req.body.phone;
  const parent = req.body.parent;
  const level = req.body.level;
  const group = req.body.group;
  const balance = req.body.balance;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return Group.find({ level })
      .then((groups) => {
        let arr = [];
        groups.forEach((item) => {
          arr.push({
            _id: item._id,
            name: item.name,
            start: convertSecondsToTime(item.start),
            end: convertSecondsToTime(item.end),
            day: days[item.day],
          });
        });
        res.status(400).render('edit-student', {
          pageTitle: 'Edit Student',
          path: `/view-students/${level}`,
          student: {
            _id: studentId,
            name,
            phone,
            parent,
            level,
            group,
            balance,
          },
          errors: errors.mapped(),
          validationErrors: errors.array(),
          groups: arr,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  }
  Student.findById(studentId)
    .then((student) => {
      student.name = name;
      student.phone = phone;
      student.parent = parent;
      student.level = level;
      student.group = group;
      student.balance = balance;
      return student
        .save()
        .then(() => {
          console.log('Student Updated');
          res.redirect(`/view-students/${level}`);
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getStudentById = (req, res, next) => {
  const studentId = req.body.id;
  Student.findById(studentId)
    .populate('group')
    .then((student) => {
      res.json(student);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.studentSearch = (req, res, next) => {
  const payload = req.body.payload;
  const level = req.body.level;
  Student.find({
    $or: [{ name: { $regex: payload } }, { phone: { $regex: payload } }],
    level,
  })
    .populate('group')
    .then((student) => res.json(student.slice(0, 5)))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.editStudentBalance = (req, res, next) => {
  console.log(req.body);
  let { studentID, balance } = req.body;
  Student.findByIdAndUpdate(studentID, {
    $inc: { balance: balance },
  })
    .then((student) => {
      balance = Number(balance) + Number(student.balance);
      res.status(200).json({ msg: 'Balance Added', balance: balance });
    })
    .catch((err) => {
      res.status(500).json('Error, try again later');
    });
};
