const config = require('../config/config')
const telegram = require('./telegram');
const User = require('../models/User')

const stripe = require("stripe")(config.STRIPE_SECRET_KEY);

module.exports = {
  upgradeTo: (plan, email, source, callback) => {
    stripe.customers.create({
      email,
      source,
      plan,
    }).then(async (customer) => {
      if(customer){
        const u = await User.fetchByEmail(email)
        if(!u){
          res.send('We couldn\`t find your email. Are you sure you typed the command /upgrade <your email>?. Contact https://t.me/heyjon for help')
          return
        }
        await User.update(u.attributes.id, {
          plan,
        })

        telegram.checkoutDone(u.attributes.id)
        callback(u.attributes.id, u.attributes.instagram_username)
      }
    })
  }
}