const firebase = require("firebase-admin")

const serviceAccount = require("./beejobs-ee60a-firebase-adminsdk-j4hbc-714a78eb50.json")

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  
})

module.exports = {firebase};

