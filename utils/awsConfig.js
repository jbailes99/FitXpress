// awsConfig.js
const AWS = require('aws-sdk')

AWS.config.update({
  region: 'us-east-1',
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:ed986499-0dec-467c-8155-2ca7e1163dec',
    userPoolId: 'us-east-1_oWniTez60',
  }),
})

module.exports = AWS
