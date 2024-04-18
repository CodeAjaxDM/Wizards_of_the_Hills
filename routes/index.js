var express = require('express');
const User = require('../models/User');
var router = express.Router();
var path = require('path');
const multer = require('multer');
const fs = require('fs');

function requireLogin(req, res, next) {
  const allowedPaths = ['/signIn', '/signUp'];

  // Check if the user has an active session
  if (req.session.user) {
    next(); // User has a session, proceed to the next middleware or route handler
  } else if (!allowedPaths.includes(req.path)) {
    // Redirect to login page if not in allowedPaths and no session
    return res.redirect('/pages/userPage/signIn');
  } else {
    next(); // Continue to the next middleware or route handler for allowedPaths
  }
}

router.use('/pages/userPage', requireLogin);
router.use('/pages/cartPage', requireLogin);
router.use('/pages/checkoutPage', requireLogin);

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

router.post('/pages/userPage/signIn', async (req, res) => {
  const user = await User.findUser(req.body.username, req.body.password);
  
  if (user !== null) {
    // Create a session for the user
    req.session.user = user;

    // Check if there's a returnTo URL in session
    const returnTo = req.session.returnTo || '/index';

    // Redirect the user to the returnTo URL
    res.redirect(returnTo);

    // Clear the returnTo URL from session
    delete req.session.returnTo;
  } else {
    res.redirect("/pages/userPage/signIn?msg=fail");
  }
});


router.post('/pages/userPage/signUp', async (req, res) => {
  try {
    const user = await User.findUser(req.body.username, req.body.password);
    
    if(user !== null){
      req.session.user = user;
      res.redirect(`/userPage`);
    } else {
      const newUser = await User.create({
        username: req.body.username,
        password: req.body.password
      });
      console.log(newUser)
      res.redirect("/pages/userPage/signIn?msg=please sign in");
    }
  } catch (error) {
    // Handle Sequelize validation or database errors
    console.error('Error creating user:', error);
    res.redirect("/pages/userPage/signUp?error=signup_failed");
  }
});


// Multer storage settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check if req.session.user exists and has a username
    if (req.session.user && req.session.user.username) {
      // Define the destination directory based on the username
      const usernameDir = `./public/users/${req.session.user.username}`;
      
      // Create the directory if it doesn't exist
      if (!fs.existsSync(usernameDir)) {
        fs.mkdirSync(usernameDir, { recursive: true });
      }

      cb(null, usernameDir); // Destination folder
    } else {
      cb(new Error('Username not found in session'), './public/images'); // Default destination
    }
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
