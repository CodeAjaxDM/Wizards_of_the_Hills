const multer = require('multer');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');  // Destination folder for uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);  // File naming
    }
});

// Init upload
const upload = multer({ storage: storage });

module.exports = upload;