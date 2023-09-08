const express = require('express')
const app = express()
require("dotenv").config();


app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// register ejs
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  console.log(req.body)
  res.send('Hello World!');
})


// 404 not found
app.use((req, res) => {
  res.status(404).render('404')
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});