const rp = require('request-promise')
const fs = require('fs');
// require('request-debug')(rp);

const request = rp.defaults({
  jar: true,
  gzip: true,
  // resolveWithFullResponse: true,
  headers: {
    'accept': '*/*',
    'accept-language': 'en,en-US;q=0.9',
    'dnt': 1,
    'origin': 'https://www.instagram.com',
    'referer': 'https://www.instagram.com/',
    'user-agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.75 Mobile Safari/537.36',
  }
});

const getCSRFToken = (jar) => {
  const cookies = jar.getCookies('https://www.instagram.com/')
  return cookies.find(cookie => {
    return cookie.key === 'csrftoken'
  })
}

const generateFormData = (filename) => {
  return {
    upload_id: Date.now(),
    photo: {
      value:  fs.createReadStream(filename),
      options: {
       filename,
       contentType: 'image/jpeg',
      }
    },
    media_type: 1,
  }
}

const login = (username, password) => {
  return new Promise(async (resolve, reject) => {
    const jar = request.jar()
    

    await request.get('https://www.instagram.com/', { jar, })
    
    const response = await request.post('https://www.instagram.com/accounts/login/ajax/', {
      jar,
      headers: {
        'x-instagram-ajax': 1,
        'x-requested-with': 'XMLHttpRequest',
        'x-csrftoken': getCSRFToken(jar).value
      },
      form: {
        username,
        password,
      },
      json: true
    })
    
    resolve({
      jar,
      status: response.status,
      authenticated: response.authenticated,
      user: response.user,
    })
  })
}

const upload = async (jar, imageData) => {
  return new Promise(async (resolve, rejec) => {
    let response;

    response = await request.post('https://www.instagram.com/create/upload/photo/', {
      formData: generateFormData(imageData.filename),
      jar,
      headers: {
        'authority': 'www.instagram.com',
        'referer': 'https://www.instagram.com/create/style/',
        'x-instagram-ajax': 1,
        'x-requested-with': 'XMLHttpRequest',
        'x-csrftoken': getCSRFToken(jar).value,
      },
      json: true
    })
    //

    response = await request.post('https://www.instagram.com/create/configure/', {
      followRedirect: false,
      jar,
      headers: {
        'authority': 'www.instagram.com',
        'referer': 'https://www.instagram.com/create/details/',
        'x-instagram-ajax': 1,
        'x-requested-with': 'XMLHttpRequest',
        'x-csrftoken': getCSRFToken(jar).value,
      },
      form: {
        upload_id: response.upload_id,
        caption: imageData.caption,
      },
      json: true
    })
    
    resolve({
      jar,
      status: response.status,
      media: response.media,
    })
  })
}

module.exports = {
  authUser: (username, password) => {
    return login(username, password)
  },

  upload: (jar, filename, caption) => {
    return upload(request.jar(jar.store), {
      filename,
      caption,
    })
  }
}
