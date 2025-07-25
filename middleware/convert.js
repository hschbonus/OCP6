const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

console.log('convertImageToWebp middleware loaded');
const convertImageToWebp = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const webpPath = req.file.path.replace(/\.(jpg|jpeg|png)$/, '.webp');
    await sharp(req.file.path).webp({ lossless: true }).toFile(webpPath);

    fs.unlinkSync(req.file.path);
    req.file.filename = path.basename(webpPath);
    req.file.path = webpPath;

    next();
  } catch (error) {
    console.error('Erreur convertImageToWebp:', error);
    next(error);
  }
};

module.exports = convertImageToWebp;
