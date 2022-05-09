const fs = require('fs');
const path = require('path');
const { spawnSync } = require('node:child_process');
const { get } = require('express/lib/response');
const DEFAULT_TYPE = 'default';
const THUMBNAIL_TYPE = 'thumbnail';
const logger = require('../../utils/logger.js').logger;

const uploadFile = (filePath, fileData, type = DEFAULT_TYPE) => {
  let uploadPath = path.join(process.env.UPLOAD_PATH, 'uploads');
  uploadPath = path.join(uploadPath, filePath);
  // eslint-disable-next-line max-len
  let fileName = fileData.name;
  if (type == THUMBNAIL_TYPE) {
    fileName = 'thumbnail.png';
  }

  if (path.extname(fileName) === '.gltf') {
    fileName = 'model.gltf';
  }
  if (path.extname(fileName) === '.zip') {
    fileName = 'model.zip';
  }

  const uploadFilePath = path.join(uploadPath, fileName);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
  }

  fileData.mv(uploadFilePath, function(err) {
    if (err) {
      logger.error(err);
    }

    logger.debug(uploadFilePath);
    if (path.extname(uploadFilePath) === '.zip') {
      const newLocal = 'close';
      // Unzip and remove zip
      // eslint-disable-next-line max-len
      spawnSync('unzip', [uploadFilePath, '-d', uploadFilePath.replace(/\.[^/.]+$/, '')]).
          on(newLocal, (code) => {
            logger.debug('Zip deleted');
            spawnSync('rm', [uploadFilePath]);
          });
    }
    return uploadFilePath;
  });
};

const getDir = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      }
      resolve(files);
      files.map((_file) => {
        file = path.join(dir, _file);
        fs.statSync(file, (error, stats) => {
          // incase of error
          if (error) {
            logger.error(error);
            return;
          }
          if (stats.isDirectory()) {
            logger.debug(`DIrectory ${file}`);
          } else {
            logger.debug(file);
          }
        });
      });
    });
  });
};

const getController = (req, res) => {
  const uploadPath = path.join(process.env.UPLOAD_PATH, 'uploads');
  getDir(uploadPath).then((values) => {
    res.json({uploads: values});
  });
};

const postController = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }
  const modelFile = req.files.model;
  const previewImage = req.files.preview;
  const fileName = req.body.name;
  logger.debug(req.body);
  uploadFile(fileName, modelFile);
  uploadFile(fileName, previewImage, THUMBNAIL_TYPE);
  res.send('File uploaded to ' + uploadFile);
};

module.exports = {
  getController,
  postController,
};
