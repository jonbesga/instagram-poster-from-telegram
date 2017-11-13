const express = require('express');
const router = express.Router();
const telegram = require('../controllers/telegram.js');

router.post('/', (req, res) => {
  telegram.bot.processUpdate(req.body);
  res.sendStatus(200);
});

module.exports = router