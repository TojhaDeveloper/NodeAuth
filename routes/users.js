var express = require('express');
var router = express.Router();
var multer = require('multer');
//Handle File uploads
var fileUploads = multer({dest : './uploads'});

var User = require('../models/user');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.render('index', {title : 'Members' });
// });

router.get('/register', function(req, res, next) {
  res.render('register', {title : 'Register'});
});

router.get('/login', function(req, res, next) {
  res.render('login', {title : 'Login'});
});

router.post('/register', fileUploads.single('profileimage'),function(req, res, next) {
  if(req.file) {
    console.log(req.file);
    var profileimage = req.file.filename;
  }else {
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
  if(errors){
    console.log('Errors');
    res.render('register', {
      errors : errors
    });
  } else {
    var newUser = new User({
      name : req.body.name,
      password : req.body.password,
      email : req.body.email,
      username : req.body.username,
      profileimage : profileimage
    });

    User.createUser(newUser, function(err, user){
     if(err) throw err;
     console.log(user);
    });

    req.flash('success', 'You are now registered and can login');
    res.location('/');
    res.redirect('/');
  }
});

module.exports = router;
