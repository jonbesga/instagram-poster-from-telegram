const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config')
const axios = require('axios');
const uuidv4 = require('uuid/v4');
const fs = require('fs');
const path = require('path')
const Instagram = require('../utils/instagram')

const User = require('../models/User')
const Photo = require('../models/Photo')

const tough = require('tough-cookie');
const CookieJar = tough.CookieJar;

const checkoutDone = (id) => {
  bot.sendMessage(id, 'Congratulations! Your account has been upgraded!')
}

const downloadPhoto = (fileURI) => {
  return new Promise(async (resolve, reject) => {
    const response = await axios.get(fileURI, { responseType: 'arraybuffer' });
    const file = response.data;
    const fileName = `${uuidv4()}.jpg`;

    const filePath = path.join(__dirname, '../images/', fileName)
    fs.writeFile(path.join(__dirname, '../images/', fileName), file, (err) => {
      if(err) { reject(err); return; }
      resolve(filePath)
    })
  })  
}

const getOrSaveUserFromId = async (id, username) => {
  let u = await User.fetch(id)
  if(!u){
    u = await User.save(id, username)
  }
  return u;
}

const getUserFromId = async (id, username) => {
  let u = await User.fetch(id)
  return u;
}

const sendStartMessage = (id) => {
  
  const startMessage = `
Welcome to Social media poster bot.

*How to use me*

This bot allows you to autopublish pictures on Instagram from any Telegram group if the bot is inside it. If you add a caption to the photo in Telegram that will be the caption on Instagram.

The free plan allows you to upload 3 pictures per day.

⬆️ If you wish to upgrade your account ($5/m), type:

\`/upgrade <your email>\`

📷 To start setting up autopublishing on Instagram, type:

\`/instagram <username> <password>\`

to login your account. Dont worry, your password isn't stored in our servers.

After a successful login, put the bot inside a group and share any picture on it. Your photo will be uploaded automatically to your account.

Don't hesitate to contact @heyjon for any problem.
`
  bot.sendMessage(id, startMessage, {
    parse_mode: 'Markdown'
  })
}

const sendUpgradeMessage = (id) => {
  bot.sendMessage(id, `
Subscribe to the bot using the following link. Your account will be upgraded automatically.
      
*Make sure you use the same email in the checkout form* so we can automatically validate your account`, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{
        text: 'Go to checkout',
        url: config.WEBHOOK_URL + '/subscription'
      }]]
    }
  })
}

const sendEmailAlreadyExists = (id) => {
  bot.sendMessage(id, 'This email already exists!')
}

const sendUpgradeMessageErrorFormat = (id) => {
  bot.sendMessage(id, 'Invalid command. Use: `/upgrade <your email>`')
}

const validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

const sendMaximumDailyUploads = (id) => {
  bot.sendMessage(id, 'Hi, you have reached your maximum number of uploads today. Think of /upgrade if you want more!')
}

const bot = new TelegramBot(config.BOT_TOKEN);
bot.setWebHook(`${config.WEBHOOK_URL}/bot${config.BOT_TOKEN}`);

bot.on('text', async (msg) => {
  if(msg.text.startsWith('/')){
    let command, parameters, u;
    [command, ...parameters] = msg.text.split(' ')
    
    switch(command){
      case '/start':
        u = await getOrSaveUserFromId(msg.from.id, msg.from.username)
        sendStartMessage(u.attributes.id)
        break;

      case '/upgrade':
        if(parameters.length !== 1){
          sendUpgradeMessageErrorFormat(msg.from.id)
          return; 
        }
        const email = parameters[0];
        if(!validateEmail(email)){
          return;
        }

        u = await User.fetchByEmail(email)
        if(u){
          sendEmailAlreadyExists(msg.from.id)
          return;
        }

        u = await getOrSaveUserFromId(msg.from.id, msg.from.username)
        await User.update(u.attributes.id, {
          email,
        })
        sendUpgradeMessage(msg.from.id)
        break;

      case '/instagram':
        if(parameters.length !== 2){
          sendInstagramMessageErrorFormat(msg.from.id)
          return;
        }
        const username = parameters[0]
        const password = parameters[1]

        u = await getOrSaveUserFromId(msg.from.id)
        loginOnInstagram(username, password, u)
        break;
        
      default:
        break;
    }
  }
})

const loginOnInstagram = async (username, password, u) => {
  try{
    const response = await Instagram.authUser(username, password)

    if(response.authenticated && response.user && response.status === 'ok'){
      await User.update(u.attributes.id, {
        instagram_username: username,
        instagram_cookie: response.jar._jar.toJSON()
      })
      bot.sendMessage(u.attributes.id, '✅ Login successful. Don\'t forget to invite me to a group (or several)')
    }
    else{
      await User.update(u.attributes.id, {
        instagram_username: username,
      })
      bot.sendMessage(u.attributes.id, '️❌ Login invalid')
    }
  }
  catch(err){
    console.log(err)
  }
}

bot.on('photo', async (msg) => {
  // The user exists and has a login cookie
  const u = await getUserFromId(msg.from.id)
  if(!u || !u.attributes.instagram_cookie){
    return;
  }
  // ...if is in the free plan has no reached the limit of daily uploads
  const numberOfUploadsToday = await Photo.getTodayUploads(u.attributes.id)
  if(u.attributes.plan == 'free' && numberOfUploadsToday >= 3){
    sendMaximumDailyUploads(msg.from.id)
    return;
  }

  // Download the photo
  const fileId = msg.photo[msg.photo.length - 1].file_id
  const fileURI = await bot.getFileLink(fileId)
  const filePath = await downloadPhoto(fileURI)

  const caption = msg.caption || ''
  
  const response = await Instagram.upload(CookieJar.fromJSON(u.attributes.instagram_cookie), filePath, caption)

  const imageURL = `https://www.instagram.com/p/${response.media.code}`
  bot.sendMessage(msg.chat.id, `Your image has been uploaded. Find it here: ${imageURL}`)

  await User.update(msg.from.id, {
    instagram_cookie: response.jar._jar.toJSON(),
  })
  await Photo.save(u.attributes.id, filePath)
})

module.exports = {
  bot,
  checkoutDone,
}