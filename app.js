const path = require('path');
const express = require('express');
const app = express();
const connection = require('./config/db');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const errorController = require('./controllers/errors');



// Define .env file
require('dotenv').config();

const store = new MongoDBStore({
  uri: process.env.CONNECTION_STRING,
  databaseName: 'AttendIt',
  collection: 'sessions',
});

// Register ejs
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// Define csrf
const csrfProtection = csrf();

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());


// Routes
const studentRoutes = require('./routes/student.routes');
const groupRoutes = require('./routes/group.routes');
const attendanceRoutes = require('./routes/attendance.routes');

app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.get('/', (req, res) => {
  console.log("HI")
  res.redirect('/home');
});

app.use(studentRoutes);
app.use(groupRoutes);
app.use(attendanceRoutes);

// Error Handling
// app.get('/500', errorController.get500);

app.use(errorController.get404);

// app.use((error, req, res, next) => {
//   res.status(500).render('500', {
//     pageTitle: 'Error!',
//     path: '/500',
//   });
// });

// Connect to database
connection();

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});
