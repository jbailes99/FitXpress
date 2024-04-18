fetch('https://lm6vr3st47.execute-api.us-east-1.amazonaws.com/default/test', {
  headers: {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    'content-type': 'application/json',
    'pragma': 'no-cache',
    'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'Referer': 'https://project.jbailes.csc475.kentros.gr/',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
  body: '{"weight":22,"height":"5\'2","age":12,"neckMeasurement":4,"waistMeasurement":23}',
  method: 'POST',
})
  .then(response => {
    return response.json()
  })
  .then(data => {
    console.log(data)
  })
  .catch(err => {
    console.error(err)
  })
