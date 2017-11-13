if(process.env.NODE_ENV != 'production'){
  require('dotenv').config();
}

module.exports.BOT_TOKEN = process.env.BOT_TOKEN
module.exports.WEBHOOK_URL = process.env.WEBHOOK_URL
module.exports.HOST = process.env.HOST
module.exports.PORT = process.env.PORT
module.exports.DATABASE_URL = process.env.DATABASE_URL
module.exports.DATABASE_NAME = process.env.DATABASE_NAME
module.exports.DATABASE_HOST = process.env.DATABASE_HOST
module.exports.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
module.exports.STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY

