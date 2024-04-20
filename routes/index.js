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
router.get('/', function (req, res, next) {
  if (req.query.msg) {
    res.locals.msg = req.query.msg
  }
  res.render('index');
});

router.get('/index', function (req, res, next) {
  if (req.query.msg) {
    res.locals.msg = req.query.msg
  }
  res.render('index');
});

router.get('/logout', function (req, res, next) {
  if (req.session.user) {
    req.session.destroy()
    res.redirect("/?msg=logout")
  } else {
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

  router.get(path, function (req, res, next) {
    // Prepare the data object to pass to the view,
    let data = {};
    if (req.query.msg) {
      data.msg = req.query.msg;  // Store message in data object to pass to EJS template
    }

    // Special handling for certain pages, like EditCreation
    if (renderPath === 'pages/userPage/EditCreation') {
        // Fetch title, description, and price from query parameters
        data.imagePath = req.query.imagePath || '/images/rat.jpg';
        data.title = req.query.title || '';
        data.description = req.query.description || '';
        data.price = req.query.price || '';
    }

    // Render the appropriate EJS template with the data object
    res.render(renderPath, data);
  });
});

router.post('/pages/userPage/signIn', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username: username } });
    if (!user) {
      return res.status(401).redirect('/pages/userPage/signIn?msg=User not found');
    }

    if (password == user.password) {
      console.log("Sign-in successful")

      // Create a session for the user
      req.session.user = user.dataValues;

      // Check if there's a returnTo URL in session
      const returnTo = req.session.returnTo || '/index';

      // Redirect the user to the returnTo URL
      res.redirect(returnTo);
    } else {
      res.redirect('/pages/userPage/signIn?msg=Incorrect password');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).redirect('/pages/userPage/signIn?msg=Error logging in');
  }
});


router.post('/pages/userPage/signUp', async (req, res) => {
  try {
    const user = await User.findUser(req.body.username, req.body.password);

    if (user !== null) {
      console.log("Sign-in successful")
      req.session.user = user;
      
      // Check if there's a returnTo URL in session
      const returnTo = req.session.returnTo || '/index';

      // Redirect the user to the returnTo URL
      res.redirect(returnTo);
    } else {
      const newUser = await User.create({
        username: req.body.username,
        password: req.body.password
      });
      console.log(newUser)
      res.redirect("/pages/userPage/signIn?msg=Account Created Successfully! Please Sign In to Continue");
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
    // Generate a unique filename
    const uniqueFilename = Date.now() + '-' + file.originalname;
    cb(null, uniqueFilename); // File name
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 500 // 500MB limit, adjust as needed
  }
});

router.post('/pages/userPage/EditCreation', upload.single('displayImage'), function (req, res, next) {
  try {
    // Get the uploaded image path

    // Check the value of the 'action' parameter from the form
    const action = req.body.action;

    if (action === 'discard') {
      // Redirect back to the ContentCreator page
      return res.redirect('/pages/userPage/creatorPage');
    }
    
    const imagePath = req.file ? '/images/' + req.file.filename : '/images/rat.jpg';

    // Capture title, description, and price from form data
    const title = req.body.title || "";
    const description = req.body.description || "";
    const price = req.body.price || "";

    console.log(imagePath, title, description, price);

    // Here you would typically update the database with the new data
    // For now, let's just send a success response
    res.json({ success: true, imagePath, title, description, price });

  } catch (error) {
    console.error('Error processing form data:', error);
    res.json({ success: false, message: 'Error processing form data' });
  }
});


router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(500).send(err.message);
  }
  next(err);
});

module.exports = router;
