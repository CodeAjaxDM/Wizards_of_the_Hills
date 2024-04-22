var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const sequelize = require('./db');
const multer = require('multer');

const User = require('./models/User');
const Item = require('./models/Item');
const Author = require('./models/author');
const Purchase = require('./models/Purchase');
var indexRouter = require('./routes/index');

var app = express();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/fonts', express.static(__dirname + '/node_modules/bootstrap/fonts'));

app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'wsu489',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/', indexRouter);

// Dynamic item page route
app.get('/item/:id', async (req, res, next) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (item) {
      res.render('itemPage', { item });
    } else {
      res.status(404).send('Item not found');
    }
  } catch (error) {
    next(error);
  }
});

// Route to handle item creation
app.post('/item/create', upload.single('imageFile'), async (req, res, next) => {
  try {
    const { name, price, authorName, authorWebsite, description } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`; // Path where the image is stored

    const newItem = await Item.create({
      name,
      price,
      authorName,
      authorWebsite,
      description,
      imageUrl
    });
    res.redirect(`/item/${newItem.id}`); // Redirect to the new item page
  } catch (error) {
    next(error);
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

async function setup() {
  try {
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

    const janeDoePurchase = await Purchase.findByPk("Jane Doe");
    if(!janeDoePurchase){
      await Purchase.create({
        username: "Jane Doe",
        itemNumber: '001'
      });
      console.log("Jane Doe - Item 001 added to Purchase Table...")
    }else {
      console.log("Jane Doe  Item 001 already exists in Purchase table!");
    }

  } catch (error) {
    console.error("Error setting up users:", error);
  }
  
}


sequelize.sync().then(() => {
  console.log("Sequelize Sync Completed...");
  setup().then(() => console.log("User setup complete"))
});


app.listen(3000, () => {
  console.log('Server started on http://localhost:3000/');
});

module.exports = app;