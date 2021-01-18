var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require("dotenv").config()
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const passport = require("passport")
var app = express();
const isAuth = require("./middleware/auth")

var mongoose = require('mongoose');
var mongoDB = process.env.DB_HOST || "mongodb+srv://ivanbatur:ivanbatur@cluster0.rxq3l.mongodb.net/odinbook?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

require('./config/passport')(passport);
app.use(passport.initialize())
app.use(passport.session());



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get('/', isAuth, (req,res)=>{
  res.send(`Hello world ${req.user.displayName}`)
})
app.get("/failure", (req, res ) => {
  res.json({success: false, msg: "Failed to login"})
})
app.get("/success", (req, res) => {
  res.json({success: true, msg: "Log in successfull"})
})
app.get('/auth/error', (req, res) => res.send('Unknown Error'))
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/error' }),
function(req, res) {
   res.redirect('/success');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
