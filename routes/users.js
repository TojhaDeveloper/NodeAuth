var express = require('express');
var router = express.Router();
var multer = require('multer');
//Handle File uploads
var fileUploads = multer({ dest: './uploads' });

var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.render('index', {title : 'Members' });
// });

router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password' }),
  function (req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
  });

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(function (username, password, done) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;
    if (!user) {
      return done(null, false, { message: 'Unknown User' });
    }
    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) return done(err);
      if (isMatch) {
        return done(null, user);
      }
      else {
        return done(null, false, { message: 'Invalid Password' });
      }
    });
  });
}));

router.post('/register', fileUploads.single('profileimage'), function (req, res, next) {
  if (req.file) {
    console.log(req.file);
    var profileimage = req.file.filename;
  } else {
    console.log('no file uploaded')
    var profileimage = 'noimage.jpg';
  }
  //Validation
  req.checkBody('name', 'Name Field is required').notEmpty();
  req.checkBody('email', 'email Field is required').notEmpty();
  req.checkBody('email', 'not a valid email').isEmail();
  req.checkBody('username', 'UserName Field is required').notEmpty();
  req.checkBody('password', 'password Field is required').notEmpty();
  req.checkBody('password2', 'passwords does not match').equals(req.body.password);

  //Check Errors
  var errors = req.validationErrors();
  if (errors) {
    console.log('Errors');
    res.render('register', {
      errors: errors
    });
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
      username: req.body.username,
      profileimage: profileimage
    });

    User.createUser(newUser, function (err, user) {
      if (err) throw err;
      console.log(user);
    });

    req.flash('success', 'You are now registered and can login');
    res.location('/');
    res.redirect('/');
  }
});

router.get('/logout', function(req, res, next){
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
})

module.exports = router;
