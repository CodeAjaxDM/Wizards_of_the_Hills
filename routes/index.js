var express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
const Author = require('../models/author');
const Purchase = require('../models/Purchase');
var router = express.Router();
var path = require('path');
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const sequelize = require('../db');

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
router.use(bodyParser.urlencoded({ extended: true }));

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
        itemPrice: item.price === 0 ? 'FREE' : `$${item.price}`,
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
  'userPage/EditAuthorPage',
  'userPage/creatorPage',
  'userPage/EditCreation',
  'userPage/signIn',
  'userPage/signUp',
  'userPage/adminPage',
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
          data.category = item.category || '';
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
      data.category = '';
    }

    if (renderPath === 'pages/userPage/creatorPage' || renderPath === 'pages/userPage/userPage' || renderPath === 'pages/userPage/authorPage' || renderPath === 'pages/userPage/EditAuthorPage') {
      try {
        // Fetch the current user
        const user = await User.findByPk(req.session.user.username);
        if (!user) {
          return res.status(404).send('User not found');
        }

        const author = await Author.findByPk(user.authorName);
        if (!author) {
          // For these pages, continue loading the page even if the author is not found
          console.warn('Author not found');
        }

        if (!data.msg) {
          data.msg = null;  // Set msg to null if it wasn't set earlier
        }

        // Fetch items for the current author or where authorName is null
        publishedItems = await Item.findAll({
          where: {
            authorName: user.authorName,
            published: true,
            ownedByAuthor: true
          },
        });

        unpublishedItems = await Item.findAll({
          where: {
            authorName: user.authorName,
            published: false,
            ownedByAuthor: true
          },
        });
        const supportLink = author ? author.supportLink : "";
        console.log(supportLink)
        data.supportLink = supportLink,
          data.authorName = user.authorName,
          data.publishedItems = publishedItems,
          data.unpublishedItems = unpublishedItems
        data.user = user;
        data.author = author;
      } catch (error) {
        next(error);
      }
    }
    else if (renderPath === 'pages/cartPage/cartPage') {
      res.render('pages/cartPage/cartPage', {
        items: req.session.cart || []
      });
    }

    else if (renderPath === 'pages/checkoutPage/checkout') {
      res.render('pages/checkoutPage/checkout', {
        items: req.session.cart || []
      });
    }

    // Render the appropriate EJS template with the data object
    res.render(renderPath, data);

  });
});

router.get('/deleteItem', async function (req, res) {
  const itemNumber = req.query.itemNumber;
  try {
    const item = await Item.findOne({ where: { itemNumber: itemNumber } });
    if (item) {
      item.ownedByAuthor = false; // Mark item as not owned by the author
      await item.save();
      req.session.msg = 'Item removed successfully';
    } else {
      req.session.msg = 'Item not found';
    }
  } catch (error) {
    console.error('Error updating item:', error);
    req.session.msg = 'Error updating item';
  }

  res.redirect('/pages/userPage/creatorPage?msg=' + req.session.msg);
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
        itemImageUrl: item.imageUrl,
        name: item.name,
        price: item.price,
        authorName: item.authorName,
        authorWebsite: item.authorWebsite,
        quantity: 1 // Quantity left incase we want to add
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

router.post('/process-checkout', async (req, res) => {
  const { cardName, cardNumber, cardExp, cardCVC } = req.body;
  if (validateCreditCard(cardNumber) && validateExpiryDate(cardExp) && validateCVC(cardCVC)) {
    try {
      // Assuming the user's session is correctly set
      const username = req.session.user.username;

      // Process each item in the cart
      for (const cartItem of req.session.cart) {
        await Purchase.create({
          username: username,
          itemNumber: cartItem.itemNumber
        });
      }
      // Clear the cart after processing
      req.session.cart = [];

      res.redirect('/pages/cartPage/cartPage'); // Redirect to a success page
    } catch (error) {
      console.error('Checkout processing error:', error);
      res.redirect('pages/checkoutPage/checkout?msg=Card Declined');
    }
  } else {
    res.redirect('pages/checkoutPage/checkout?msg=Card Invalid');
  }
});

function validateCreditCard(name, number) {
  // Implement or use a library for the Luhn algorithm to check credit card validity
  return true; // Placeholder return
}

function validateExpiryDate(exp) {
  // Simple validation for expiration date
  const currentYear = new Date().getFullYear() % 100; // Get the last two digits of the current year
  const currentMonth = new Date().getMonth() + 1;
  const [expMonth, expYear] = exp.split('/').map(num => parseInt(num, 10));
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    alert('The expiration date must be in the future.');
    expInput.value = ''; // Clear the invalid expiration date
    return false;
  }

  return true;
}

function validateCVC(cvc) {
  // Simple CVC check (3-4 digits) for now
  return cvc.length === 3 || cvc.length === 4;
}

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
    const category = (req.body.category || "").toLowerCase();

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
        item.category = category;
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
        imageUrl: imagePath,
        category: category
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

router.post('/pages/userPage/EditAuthorPage', upload.single('authorImageUpload'), async function (req, res, next) {
  try {
    // Check the value of the 'action' parameter from the form
    const action = req.body.action;

    if (action === 'discard') {
      // Redirect back to the ContentCreator page
      return res.redirect('/pages/userPage/creatorPage');
    }

    const authorName = req.session.user.authorName;

    // Capture about, authorImg, and supportLink from form data
    const about = req.body.about || "";
    console.log("About from form:", about);  // Debugging line

    let authorImg = "/images/author-img.jpg";  // Default image

    if (req.file) {
      authorImg = `/users/${req.session.user.username}/${req.file.filename}`;
    } else {
      const existingAuthor = await Author.findByPk(authorName);
      if (existingAuthor) {
        authorImg = existingAuthor.authorImg;
      }
    }

    let supportLink = req.body.supportLink || "";  // This will get the supportLink as a string

    let author = await Author.findByPk(authorName);

    if (!author) {
      return res.status(404).json({ success: false, message: 'Author not found' });
    }

    // Update the Author object with new data
    author.about = about;
    console.log("About before save:", author.about);  // Debugging line
    author.authorImg = authorImg;
    author.supportLink = supportLink;  // Update supportLink as a single string

    try {
      // Try to save the author with the provided supportLink
      await author.save();
    } catch (error) {
      // If validation error due to invalid URL, fetch the existing supportLink for the author
      if (error.name === 'SequelizeValidationError' && error.errors.some(err => err.path === 'supportLink' && err.validatorKey === 'isURL')) {
        const existingAuthor = await Author.findByPk(authorName);
        supportLink = existingAuthor.supportLink;  // Use the existing supportLink
        author.supportLink = supportLink;  // Update author object
        await author.save();  // Save the author again with the existing supportLink
      } else {
        throw error;  // If it's not a validation error or not related to supportLink, re-throw the error
      }
    }

    // Redirect to a different page or render a view
    res.redirect('/pages/userPage/authorPage');  // Change this to the appropriate page

  } catch (error) {
    console.error('Error processing form data:', error);
    res.json({ success: false, message: 'Error processing form data' });
  }
});



router.post('/updateAuthorName', async function (req, res) {
  const newAuthorName = req.body.authorName;
  const oldAuthorName = req.session.user.authorName; // Get the old author name from session

  try {
    // Check if the new author name is already taken in User model
    const existingUserWithSameAuthorName = await User.findOne({
      where: {
        authorName: newAuthorName
      }
    });

    if (existingUserWithSameAuthorName && existingUserWithSameAuthorName.username !== req.session.user.username) {
      // If the author name is not unique
      req.session.msg = 'Author name taken';
      return res.redirect('/pages/userPage/creatorPage?msg=' + req.session.msg);
    }

    // Use a transaction to ensure data integrity
    await sequelize.transaction(async (t) => {
      // Update the current user's author name in User model
      const user = await User.findByPk(req.session.user.username, { transaction: t });
      if (user) {
        user.authorName = newAuthorName;
        await user.save({ transaction: t });
      }

      // Update or create the author name in Author model
      let author = await Author.findByPk(newAuthorName, { transaction: t });
      if (!author) {
        // If the author doesn't exist, create a new one
        author = await Author.create({
          authorName: newAuthorName,
          supportLink: "https://www.patreon.com/home",  // Set supportLink as a string
          about: "I don't like to talk about myself"
        }, { transaction: t });
      } else {
        // If the author exists, update the support link to default if not already set
        if (!author.supportLink) {
          author.supportLink = "https://www.patreon.com/home";
          await author.save({ transaction: t });
        }
      }

      // Update all items with the old author name to use the new author name
      const [updatedItemCount, updatedItemRows] = await Item.update(
        { authorName: newAuthorName },
        {
          where: {
            authorName: oldAuthorName,
            ownedByAuthor: true
          },
          returning: true, // Ensure that updated rows are returned
          transaction: t
        }
      );

      if (updatedItemCount !== updatedItemRows.length) {
        // If the number of updated items doesn't match the number of items returned, the update failed
        throw new Error('Item update failed');
      }
    });

    req.session.user.authorName = newAuthorName; // Update session data
    req.session.msg = 'Successfully updated';
  } catch (error) {
    console.error('Error updating author name:', error);
    req.session.msg = 'Error updating author name';
  }

  // Redirect to the creatorPage with the message
  res.redirect('/pages/userPage/creatorPage?msg=' + req.session.msg);
});


router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(500).send(err.message);
  }
  next(err);
});

router.get('/getAllUsers', async function (req, res) {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

router.get('/getAllItems', async function (req, res) {
  try {
    const items = await Item.findAll({
      attributes: ['itemNumber', 'name', 'authorName']
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching items' });
  }
});

router.get('/getAllAuthors', async function (req, res) {
  try {
    const authors = await Author.findAll();
    res.json(authors);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching authors' });
  }
});

router.get('/getPurchasesForAdmin', async function (req, res) {
  try {
    // Fetch all purchases
    // For simplicity, we'll just send itemIds and userIds
    const purchases = await Purchase.findAll({
      attributes: ['itemId', 'userId']
    });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching purchases' });
  }
});

router.get('/resetDatabase', async (req, res) => {
  try {
    // Delete all items
    await Item.destroy({ where: {} });

    // Delete all users
    await User.destroy({ where: {} });

    // Reset Authors table
    await Author.destroy({ where: {} });

    // Create or update user "subu"
    const [subu, subuCreated] = await User.findOrCreate({
      where: { username: "subu" },
      defaults: { password: "1234" }
    });

    if (subuCreated) {
      console.log("subu instance created...");
    } else {
      console.log("subu already exists!");
    }

    // Create or update user "Jane Doe"
    const [janeDoe, janeDoeCreated] = await User.findOrCreate({
      where: { username: "Jane Doe" },
      defaults: {
        password: "admin",
        isAdmin: true,
        authorName: "Jane Doe"
      }
    });

    if (janeDoeCreated) {
      console.log("Jane Doe instance created...");

      // Add Jane Doe to the Author table
      await Author.create({
        authorName: "Jane Doe",
        authorImg: "/images/author-img.jpg"
      });

      console.log("Jane Doe added to Author table...");

    } else {
      console.log("Jane Doe already exists!");

      // Update "Jane Doe" if she already exists in the Author table
      const janeDoeAuthor = await Author.findByPk("Jane Doe");
      if (!janeDoeAuthor) {
        await Author.create({
          authorName: "Jane Doe",
          authorImg: "/images/author-img.jpg"
        });
        console.log("Jane Doe added to Author table...");
      } else {
        console.log("Jane Doe already exists in Author table!");
      }
    }

    // Run the addItemsScript.js to add items
    const addItemsScript = require('../addItemsScript'); // Adjust the path as needed
    await addItemsScript();

    res.json({ msg: 'Database reset successfully' });
  } catch (error) {
    console.error("Error resetting database:", error);
    res.status(500).json({ msg: 'Error resetting database' });
  }
});

router.post('/banUser', async (req, res) => {
  const usernameToBan = req.body.username; // Get the username from the request body

  try {
    // Find the user by username
    const user = await User.findOne({ where: { username: usernameToBan } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete the user
    await user.destroy();

    // Update items owned by the user
    const items = await Item.update(
      { ownedByAuthor: false },
      { where: { authorName: usernameToBan } }
    );

    res.json({ success: true, message: 'User banned successfully' });

  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ success: false, message: 'Error banning user' });
  }
});
router.get('/browseAll', async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { published: 1 } // Add this to filter for published items
    });
    res.render('pages/categories/browseAll', { items: items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send("Error loading the page");
  }
});

router.get('/characterOptions', async (req, res, next) => {
  try {
    const characterOptionsItems = await Item.findAll({
      where: {
        category: 'character options',
        published: 1
      }
    });
    res.render('pages/categories/characterOptions', { items: characterOptionsItems });
  } catch (error) {
    console.error('Error fetching character options items:', error);
    res.status(500).send("Error loading the character options page");
  }
});

router.get('/magicalItems', async (req, res, next) => {
  try {
    const magicalItemsItems = await Item.findAll({
      where: {
        category: 'magical items',
        published: 1
      } // Fetch items with category 'character options' from the database
    });

    res.render('pages/categories/magicalItems', { items: magicalItemsItems }); // Pass the items to the 'characterOptions.ejs' template
  } catch (error) {
    console.error('Error fetching magical items items:', error);
    res.status(500).send("Error loading the magical items page");
  }
});

router.get('/prewrittenAdventures', async (req, res, next) => {
  try {
    const prewrittenAdventuresItems = await Item.findAll({
      where: {
        category: 'prewritten adventures',
        published: 1
      } // Fetch items with category 'character options' from the database
    });

    res.render('pages/categories/prewrittenAdventures', { items: prewrittenAdventuresItems }); // Pass the items to the 'characterOptions.ejs' template
  } catch (error) {
    console.error('Error fetching prewritten adventures items:', error);
    res.status(500).send("Error loading the prewritten adventures page");
  }
});

router.get('/ruleBooks', async (req, res, next) => {
  try {
    const ruleBooksItems = await Item.findAll({
      where: {
        category: 'rule books',
        published: 1
      } // Fetch items with category 'character options' from the database
    });

    res.render('pages/categories/ruleBooks', { items: ruleBooksItems }); // Pass the items to the 'characterOptions.ejs' template
  } catch (error) {
    console.error('Error fetching rule books items:', error);
    res.status(500).send("Error loading the rule books page");
  }
});

router.get('/contact', (req, res) => {
  res.render('contact');
});

router.get('/privacyPolicy', (req, res) => {
  res.render('privacyPolicy');
});

router.get('/aboutUs', (req, res) => {
  res.render('aboutUs');
});

router.get('/newsletter', (req, res) => {
  res.render('newsletter');
});

const { Sequelize, Op } = require('sequelize');

router.get('/search', async (req, res) => {
  try {
    // Retrieve the search query from the query string
    const { q } = req.query;

    if (q) {
      const searchResults = await Item.findAll({
        where: {
          published: 1,
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { category: { [Op.like]: `%${q}%` } },
            { authorName: { [Op.like]: `%${q}%` } },
          ]
        },
      });

      // Check if searchResults is actually empty
      if (searchResults.length === 0) {
        console.log("No items matched the search criteria.");
      }

      // Render the search results page with the found items
      res.render('searchResults', { items: searchResults, searchQuery: q });
    } else {
      console.log("No search query provided, redirecting to browse all.");
      // If there is no search query, redirect to browse all
      res.redirect('/browseAll');
    }
  } catch (error) {
    console.error('Error performing search:', error);
    res.status(500).send("Error loading the search results page");
  }
});

module.exports = router;
