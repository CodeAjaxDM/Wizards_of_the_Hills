var express = require('express');
const User = require('../models/User');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.query.msg){
    res.locals.msg = req.query.msg
  }
  res.render('index');
});

router.post('/login', async function(req, res, next) {
  //console.log(req.body.username+" - "+req.body.password);
  const user = await User.findUser(req.body.username, req.body.password)
  if(user!== null){
    req.session.user = user
    res.redirect("/courses")
  }else{
    res.redirect("/?msg=fail")
  }
});

router.get('/logout', function(req,res, next){
  if(req.session.user){
    req.session.destroy()
    res.redirect("/?msg=logout")
  }else {
    res.redirect("/")
  }
})

/* GET user page. */
router.get('/pages/userPage/userPage', function(req, res, next) {
  if(req.query.msg){
    res.locals.msg = req.query.msg
  }
  res.render('/pages/userPage/userPage');
});

/* GET author page. */
router.get('/pages/userPage/authorPage', function(req, res, next) {
  if(req.query.msg){
    res.locals.msg = req.query.msg
  }
  res.render('/pages/userPage/authorPage');
});

/* GET user page. */
router.get('/pages/userPage/creatorPage', function(req, res, next) {
  if(req.query.msg){
    res.locals.msg = req.query.msg
  }
  res.render('/pages/userPage/creatorPage');
});

/* GET user page. */
router.get('/pages/userPage/EditCreation', function(req, res, next) {
  if(req.query.msg){
    res.locals.msg = req.query.msg
  }
  res.render('/pages/userPage/EditCreation');
});

/* GET user page. */
router.get('/pages/userPage/signIn', function(req, res, next) {
  if(req.query.msg){
    res.locals.msg = req.query.msg
  }
  res.render('/pages/userPage/signIn');
});

/* GET user page. */
router.get('/pages/userPage/signUp', function(req, res, next) {
  if(req.query.msg){
    res.locals.msg = req.query.msg
  }
  res.render('/pages/userPage/signUp');
});

module.exports = router;
