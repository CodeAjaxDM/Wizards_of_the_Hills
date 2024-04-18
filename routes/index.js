var express = require('express');
const User = require('../models/User');
var router = express.Router();
var path = require('path');
const multer = require('multer');


/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.query.msg){
    res.locals.msg = req.query.msg
  }
  res.render('index');
});

router.get('/index', function(req, res, next) {
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

// Define an array of routes and their corresponding page names
const routes = [
  'userPage/userPage',
  'userPage/authorPage',
  'userPage/creatorPage',
  'userPage/EditCreation',
  'userPage/signIn',
  'userPage/signUp',
  'itemPages/companionAnimalsExpanded',
  'itemPages/escapeFromEthmoria',
  'itemPages/nextLevelSpellbook',
  'itemPages/owlfolkExpansion',
  'categories/browseAll',
  'categories/characterOptions',
  'categories/magicalItems',
  'categories/prewrittenAdventures',
  'categories/ruleBooks',
  'checkoutPage/checkout',
  'cartPage/cartPage',
];

// Iterate over the routes array to define the routes dynamically
routes.forEach(route => {
  const path = `/pages/${route}`;
  const renderPath = `pages/${route}`;
  
  router.get(path, function(req, res, next) {
    if (req.query.msg) {
      res.locals.msg = req.query.msg;
    }
    if(renderPath === `pages/userPage/EditCreation`)
    {
      const imagePath = '/images/rat.jpg';
      res.render(renderPath, { imagePath: imagePath });
    }
    else
    {
    res.render(renderPath);
    }
  });
});


// Multer storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images'); // Destination folder
  },
  filename: function (req, file, cb) {
    cb(null, 'uploadedImage' + path.extname(file.originalname)); // File name
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 500 // 500MB limit, adjust as needed
  }
});

const simple_upload = multer({ dest: './public/images' }); // Default destination

router.post('/pages/userPage/EditCreation', upload.single('displayImage'), function(req, res, next) {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Get the uploaded image path
  const imagePath = '/images/' + req.file.filename;
  console.log(imagePath)

  // Redirect to the same page with the uploaded image path as a query parameter
  res.redirect('/pages/userPage/EditCreation?imagePath=' + imagePath);
});


router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(500).send(err.message);
  }
  next(err);
});

module.exports = router;
