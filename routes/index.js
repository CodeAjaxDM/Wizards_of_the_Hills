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
    let message = req.session?.msg;  // Store the message temporarily
    let publishedItems = [];
    let unpublishedItems = [];

    if (message) {
      data.msg = message;  // Store message in data object to pass to EJS template
      delete req.session.msg;  // Delete the message from the session
    }
    
    if (req.query.msg) {
      data.msg = req.query.msg;  // Store message in data object to pass to EJS template
    }

    // Check if an item number is provided
    if (req.query.itemNumber) {
      try {
        // Fetch item by item number
        const item = await Item.findOne({
          where: {
            itemNumber: req.query.itemNumber
          }
        });

        if (item) {
          // Map item data to the required properties
          data.imagePath = item.imageUrl || '/images/author-img.jpg';
          data.title = item.name || '';
          data.description = item.description || '';
          data.price = item.price || '';
          data.publishStatus = item.published ? 'publish' : 'unpublish';
          data.itemNumber = item.itemNumber;
        } else {
          return res.status(404).send('Item not found');
        }
      } catch (error) {
        return next(error);
      }
    } else {
      // Default values if no item number is provided

      data.imagePath = '/images/author-img.jpg';
      data.title = '';
      data.description = '';
      data.price = '';
      data.publishStatus = 'unpublish';
      data.itemNumber = false;
    }
    
    if (renderPath === 'pages/userPage/creatorPage') {
      try {
        // Fetch the current user
        const user = await User.findByPk(req.session.user.username);
        if (!user) {
          return res.status(404).send('User not found');
        }
        
        if (!data.msg) {
          data.msg = null;  // Set msg to null if it wasn't set earlier
        }
    
        // Fetch items for the current author or where authorName is null
        publishedItems = await Item.findAll({
          where: {
            authorName: user.authorName,
            published: true
          },
        });
    
        unpublishedItems = await Item.findAll({
          where: {
            authorName: user.authorName,
            published: false
          },
        });
        
        data.authorName = user.authorName,
        data.publishedItems = publishedItems,
        data.unpublishedItems = unpublishedItems
      }catch (error) {
          next(error);
      }
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
  const { username, password } = req.body;
  try {
    // Check if user with the same username already exists
    const existingUser = await User.findOne({ where: { username: username } });
    
    if (existingUser) {
      // User with the same username already exists
      console.log("Username already exists");
      return res.redirect("/pages/userPage/signIn?msg=Username already taken. Please choose a different username.");
    } else {
      // Create new user
      const newUser = await User.create({
        username: username,
        password: password
      });
      
      console.log("Sign-up successful");
      req.session.user = newUser;
      res.redirect("/pages/userPage/signIn?msg=Account Created Successfully! Please Sign In to Continue");
    }
  } catch (error) {
    // Check for unique constraint error
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('Username already exists:', error);
      return res.redirect("/pages/userPage/signUp?error=Username already taken. Please choose a different username.");
    }
    
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

router.post('/pages/userPage/EditCreation', upload.single('displayImage'), async function (req, res, next) {
  try {
    // Get the uploaded image path

    // Check the value of the 'action' parameter from the form
    const action = req.body.action;

    if (action === 'discard') {
      // Redirect back to the ContentCreator page
      return res.redirect('/pages/userPage/creatorPage');
    }
    
    const imagePath = req.file ? `/users/${req.session.user.username}/${req.file.filename}` : req.body.existingImagePath;

    // Capture title, description, and price from form data
    const title = req.body.title || "";
    const description = req.body.description || "";
    const price = req.body.price || "";
    const publishStatus = req.body.publishStatus || 'unpublish';
    const published = publishStatus === 'publish' ? true : false;
    const itemNumber = req.body.itemNumber || false;
    const itemCount = await Item.count();  // Count all items
    const newItemNumber = itemCount + 1;  // Generate the next item number
    
    console.log(imagePath, title, description, price, publishStatus, itemNumber, newItemNumber);

    let item;
    if (itemNumber) {
      item = await Item.findOne({ where: { itemNumber: itemNumber } });
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }
      else {
        item.name = title;
        item.description = description;
        item.price = price;
        item.published = published;
        item.imageUrl = imagePath;
      }
    } else {
      // If itemNumber is not provided, create a new item
      item = await Item.create({
        itemNumber: newItemNumber,
        name: title,
        description: description,
        price: price,
        authorName: req.session.user.authorName,
        published: published,
        imageUrl: imagePath
      });
    }
    await item.save();

    // Here you would typically update the database with the new data
    // For now, let's just send a success response
    res.json({ success: true, imagePath, title, description, price, publishStatus });

  } catch (error) {
    console.error('Error processing form data:', error);
    res.json({ success: false, message: 'Error processing form data' });
  }
});

router.post('/updateAuthorName', async function(req, res) {
  const newAuthorName = req.body.authorName;
  try {
    const user = await User.findByPk(req.session.user.username);
    if (user) {
      const existingUserWithSameAuthorName = await User.findOne({
        where: {
          authorName: newAuthorName
        }
      });

      if (existingUserWithSameAuthorName && existingUserWithSameAuthorName.username !== user.username) {
        // If the author name is not unique
        req.session.msg = 'Author name taken';
      } else {
        // If the author name is unique, update the user's author name
        user.authorName = newAuthorName;
        await user.save();
        req.session.msg = 'Successfully updated';
      }
    } else {
      res.status(404).send('User not found');
    }
    // Redirect to the creatorPage with the message
    res.redirect('/pages/userPage/creatorPage?msg=' + req.session.msg);
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
