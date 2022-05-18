const fs = require('fs');
const path = require('path');
const {spawnSync} = require('node:child_process');
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
  if (path.extname(fileName) === '.obj') {
    fileName = 'model.obj';
  }
  if (path.extname(fileName) === '.stl') {
    fileName = 'model.stl';
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
      // Unzip and remove zip
      // eslint-disable-next-line max-len
      spawnSync('unzip', [uploadFilePath, '-d', uploadFilePath.replace(/\.[^/.]+$/, '')]);
      spawnSync('rm', [uploadFilePath]);
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
  logger.debug(req);

  if (!req.files || Object.keys(req.files).length === 0) {
    logger.error('No files were uploaded.');
    res.status(400).json({message: 'No files were uploaded.'});
    return;
  }

  const modelFile = req.files.model;
  const previewImage = req.files.preview;
  const fileName = req.body.name;
  logger.debug(req.body);

  if (modelFile == null || previewImage == null) {
    logger.error('All files are required');
    res.status(400).json({message: 'All files are required'});
    return;
  }

  try {
    uploadFile(fileName, modelFile);
    uploadFile(fileName, previewImage, THUMBNAIL_TYPE);
  } catch (error) {
    logger.error(error);
    res.status(400).json({message: 'Upload failed'});
    return;
  }

  res.status(200).json({message: 'Files Uploaded'});
};

module.exports = {
  getController,
  postController,
};
