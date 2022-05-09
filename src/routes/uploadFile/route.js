const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const cors = require('cors');
const controller = require('./controller');

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

router.route('/').post(cors(corsOptions), controller.postController );
router.route('/').get(cors(corsOptions), controller.getController);

module.exports = {router};
