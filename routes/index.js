var express = require('express');
const User = require('../models/User');
const Item = require('../models/Item');
var router = express.Router();
var path = require('path');

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
    if (req.query.msg) {
      res.locals.msg = req.query.msg;
    }
    res.render(renderPath);
  });
});

module.exports = router;
