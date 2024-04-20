var express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
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

const app = express();

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Set the directory where express looks for views

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    // Fetch featured items, example using findAll
    const featuredItems = await Item.findAll({
      limit: 4 // Assuming you're featuring 4 items
    });

    if (req.query.msg) {
      res.locals.msg = req.query.msg;
    }
    // Pass featured items to the view
    res.render('index', { featuredItems });
  } catch (error) {
    next(error);
  }
});

router.get('/index', function (req, res) {
  res.redirect('/');
}); //redirect '/index' to just '/'

router.get('/item/:itemNumber', async function (req, res, next) {
  try {
    const item = await Item.findOne({ where: { itemNumber: req.params.itemNumber } });
    if (item) {
      res.render('itemPage', {
        itemName: item.name,
        itemDescription: item.description,
        itemPrice: item.price === 0 ? 'FREE' : `$${item.price.toFixed(2)}`,
        itemNumber: item.itemNumber,
        authorName: item.authorName,
        authorWebsite: item.authorWebsite || '#', // Provide a fallback URL
        itemImageUrl: item.imageUrl
      });
    } else {
      res.status(404).send('Item not found');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/login', async function (req, res, next) {
  const user = await User.findUser(req.body.username, req.body.password)
  if (user !== null) {
    req.session.user = user
    res.redirect("/courses")
  } else {
    res.redirect("/?msg=fail")
  }
});

router.get('/logout', function (req, res) {
  if (req.session.user) {
    req.session.destroy(function (err) {
      if (err) {
        console.error('Session destruction error:', err);
        return next(err);
      }
      // Redirect to the home page with a logout message
      res.redirect('/?msg=logout');
    });
  } else {
    // If the user is not logged in, simply redirect to the home page
    res.redirect('/');
  }
});

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

  router.get(path, async function (req, res, next) {
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
    else if (renderPath === 'pages/userPage/creatorPage') {
      const user = await User.findByPk(req.session.user.username);
      data.authorName = user ? user.authorName : '';
    }
    else if (renderPath === 'pages/cartPage/cartPage') {
      res.render('pages/cartPage/cartPage', {
        items: req.session.cart || []
      });
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

router.post('/add-to-cart', async (req, res) => {
  const { itemNumber } = req.body; // Ensure this matches the name attribute in the form
  const item = await Item.findOne({ where: { itemNumber: itemNumber } });

  if (item) {
    if (!req.session.cart) {
      req.session.cart = [];
    }
    const cartItem = req.session.cart.find(i => i.itemNumber === item.itemNumber);
    if (cartItem) {
      cartItem.quantity += 1; // Increment quantity if item already in cart
    } else {
      // Add new item to cart
      req.session.cart.push({
        itemNumber: item.itemNumber,
        name: item.name,
        price: item.price,
        quantity: 1 // Start with a quantity of 1
      });
    }

    res.redirect('/pages/cartPage/cartPage'); // Redirect to the cart page
  } else {
    res.status(404).send('Item not found');
  }
});

router.post('/remove-from-cart', (req, res) => {
  const { itemNumber } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.itemNumber !== itemNumber);
  }

  res.redirect('/pages/cartPage/cartPage'); // Re-render cart for changes
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

router.post('/updateAuthorName', async function (req, res) {
  const newAuthorName = req.body.authorName;
  try {
    const user = await User.findByPk(req.session.user.username);
    if (user) {
      user.authorName = newAuthorName;
      await user.save();
      res.redirect('/pages/userPage/creatorPage');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error updating author name:', error);
    res.status(500).send('Error updating author name');
  }
});

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(500).send(err.message);
  }
  next(err);
});

module.exports = router;
