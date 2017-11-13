const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config/config')

const telegram = require('./routes/telegram.js');
const subscription = require('./routes/subscription.js');

const app = express();
app.set('view engine', 'pug')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'))

app.use(`/bot${config.BOT_TOKEN}`, telegram)
app.use(`/subscription`, subscription)

app.listen(config.PORT, config.HOST, () => {
  console.log(`Express server is listening on http://${config.HOST}:${config.PORT}`);
});
