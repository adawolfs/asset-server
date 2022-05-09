const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express();
const port = 3000;
require('dotenv').config();
const logger = require('./utils/logger.js').logger;

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: {fileSize: 50 * 1024 * 1024},
}));

// app.use(helmet());
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};
app.use('/uploads', cors(corsOptions), express.static('uploads'));
app.get('/', (req, res) => {
  res.send('Hello World!');
});

const uploadFileRoute = require('./routes/uploadFile/route');
app.use('/upload', uploadFileRoute.router);

app.listen(port, () => {
  logger.info('Server is running on port 3000');
});
