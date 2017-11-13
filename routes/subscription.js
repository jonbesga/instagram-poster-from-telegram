const config = require('../config/config')
const express = require('express');
const router = express.Router();

const subscription = require('../controllers/subscription.js');
const path = require('path')

router.get('/', (req, res) => {
  res.render('subscription', {stripePublicKey: config.STRIPE_PUBLIC_KEY})
})

router.post('/checkout', (req, res) => {
  subscription.upgradeTo('basic', req.body.stripeEmail, req.body.stripeToken,
  (id, instagramUsername) => {
    res.send(`Your plan is being upgrated. The bot will send you a message to let you know.\nInstagram account: ${instagramUsername}\nTelegram ID: ${id}`)
  })
})

module.exports = router