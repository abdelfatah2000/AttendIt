const Group = require('../models/group.model');
const Student = require('../models/student.model');
const moment = require('moment');
const { validationResult } = require('express-validator');

const currentDate = (seconds) => {
  const time = convertSecondsTo24Time(seconds);
  const [hour, minutes] = time.split(':');
  const today = new Date();
  today.setHours(hour);
  today.setMinutes(minutes);
  return today;
};

const convertTimeTOSeconds = (time) => {
  let a = time.split(':');
  let seconds = +a[0] * 60 * 60 + +a[1] * 60;
  return seconds;
};

const convertSecondsToTime = (seconds) => {
  let time = new Date(seconds * 1000).toISOString().substring(11, 16);
  time = moment(time, 'HH:mm').format('hh:mm A');
  return time;
};

const convertSecondsTo24Time = (seconds) => {
  let time = new Date(seconds * 1000).toISOString().substring(11, 16);
  time = moment(time, 'HH:mm').format('HH:mm');
  return time;
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

exports.getAddGroup = (req, res, next) => {
  res.render('add-group', {
    path: '/add-group',
    pageTitle: 'Add Group',
    hasError: false,
    validationErrors: [],
  });
};

exports.postAddGroup = (req, res, next) => {
  const start = convertTimeTOSeconds(req.body.start);
  const end = convertTimeTOSeconds(req.body.end);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('add-group', {
      path: '/add-group',
      hasError: true,
      group: {
        name: req.body.name,
        start: req.body.start,
        end: req.body.end,
        level: req.body.level,
        day: req.body.day,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const group = new Group({
    name: req.body.name,
    start,
    end,
    level: req.body.level,
    day: req.body.day,
  });

  group
    .save()
    .then((result) => {
      console.log('Group Created');
      res.redirect('/add-group');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getGroupForLevel = (req, res, next) => {
  let arr = [];
  Group.find({ level: req.body.level })
    .select('_id name start end day')
    .then((groups) => {
      groups.forEach((item) => {
        arr.push({
          _id: item._id,
          name: item.name,
          start: convertSecondsToTime(item.start),
          end: convertSecondsToTime(item.end),
          day: days[item.day],
        });
      });
      res.json(arr);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getManageGroup = (req, res, next) => {
  const level = req.params.level;
  Group.aggregate([
    {
      $match: {
        level: level,
      },
    },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'group',
        as: 'students',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        start: 1,
        end: 1,
        day: 1,
        students: { $size: '$students' },
      },
    },
  ])
    .then((groups) => {
      let arr = [];
      groups.forEach((item) => {
        arr.push({
          _id: item._id,
          name: item.name,
          start: convertSecondsToTime(item.start),
          end: convertSecondsToTime(item.end),
          day: days[item.day],
          students: item.students,
        });
      });
      res.render('view-groups', {
        path: `/view-groups/${level}`,
        groups: arr,
        pageTitle: `${level} Level Groups`,
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

exports.getEditGroup = (req, res, next) => {
  Group.findById(req.params.groupId)
    .then((group) => {
      Student.find({ group: req.params.groupId })
        .then((students) => {
          res.render('edit-group', {
            path: `/view-groups/${group.level}`,
            group: {
              _id: group._id,
              name: group.name,
              start: convertSecondsTo24Time(group.start),
              end: convertSecondsTo24Time(group.end),
              day: days[group.day],
            },
            students,
            pageTitle: 'Edit Group',
            validationErrors: [],
          });
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

exports.postEditStudent = (req, res, next) => {
  const groupId = req.body.groupId;
  const name = req.body.name;
  const level = req.body.level;
  const day = req.body.day;
  const start = req.body.start;
  const end = req.body.end;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('edit-group', {
      path: `/view-groups/${level}`,
      pageTitle: 'Edit Group',
      group: {
        _id,
        groupId,
        level,
        name,
        start,
        end,
        day,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  Group.findById(groupId).then((group) => {
    group.name = name;
    group.day = day;
    group.level = level;
    group.start = convertTimeTOSeconds(start);
    group.end = convertTimeTOSeconds(end);
    return group
      .save()
      .then(() => {
        console.log('Group Updated');
        res.redirect(`/view-groups/${level}`);
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.deleteGroup = (req, res, next) => {
  const id = req.body.groupId;
  Student.find({ group: id })
    .then((students) => {
      if (students.length > 0) {
        return res.status(400).json("Group can't be deleted");
      }
      Group.findByIdAndDelete(id).then(() => {
        console.log('Group is Deleted');
        res.status(200).json('Group is Deleted');
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getHome = (req, res, next) => {
  Student.aggregate([
    {
      $group: {
        _id: null,
        first: {
          $sum: { $cond: [{ $eq: ['$level', 'First'] }, 1, 0] },
        },
        second: {
          $sum: { $cond: [{ $eq: ['$level', 'Second'] }, 1, 0] },
        },
        third: {
          $sum: { $cond: [{ $eq: ['$level', 'Third'] }, 1, 0] },
        },
      },
    },
  ])
    .then((result) => {
      let obj = {};
      obj.first = result[0].first;
      obj.second = result[0].second;
      obj.third = result[0].third;
      return res.render('home', {
        path: '/home',
        students: obj,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getGroupsForCalendar = (req, res, next) => {
  Group.find({})
    .then((groups) => {
      let arr = [];
      groups.forEach((element) => {
        var color =
          element.level === 'First'
            ? '#D7A9E3FF'
            : element.level === 'Second'
            ? '#8BBEE8FF'
            : '#A8D5BAFF';
        arr.push({
          title: `${element.name}`,
          start: currentDate(element.start),
          end: currentDate(element.end),
          daysOfWeek: [`${element.day - 1}`],
          allDay: false,
          color,
        });
      });
      res.json(arr);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
