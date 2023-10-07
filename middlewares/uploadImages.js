const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, path.join(__dirname, "../public/images/"));
  },
  filename: function (req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    callback(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },
});


const multerFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(new Error("Not an image! Please upload only images"), false);
  }
};

const uploadPhotos = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 },
});


const productImgResize = async (req, res, next) => {
  if (!req.files) return next();
  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/images/products/${file.filename}`);
    })
  );
  next();
};

module.exports = { uploadPhotos, productImgResize };
