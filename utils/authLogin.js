const readline = require('readline')
const AWS = require('./awsConfig')
const authService = require('./authService')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

async function handleSignUp() {
  try {
    console.log('welcome')
    const gender = await askQuestion('Enter gender:')
    const nickname = await askQuestion('Enter nickname:')
    const username = await askQuestion('Enter username:')
    const password = await askQuestion('Enter password:')
    const email = await askQuestion('Enter email:')
    const confirmationCode = await askQuestion('Enter confirmation code:')

    await authService.signUp(username, password, email, nickname, gender)
    await authService.confirmSignUp(username, confirmationCode)
  } catch (error) {
    console.error('Sign-up error:', error)
  } finally {
    rl.close()
  }
}

async function handleSignIn() {
  try {
    const username = await askQuestion('Enter username:')
    const password = await askQuestion('Enter password:')

    await authService.signIn(username, password)
  } catch (error) {
    console.error('Sign-in error:', error)
  } finally {
    rl.close()
  }
}

async function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question + ' ', answer => {
      resolve(answer)
    })
  })
}
async function handleSignOut(accessToken) {
  try {
    await authService.signOut(accessToken)
  } catch (error) {
    console.error('Sign-out error:', error)
  } finally {
    rl.close()
  }
}
// test
// handleSignUp()
// handleSignIn()
// handleSignOut()
