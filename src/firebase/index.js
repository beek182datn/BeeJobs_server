const firebase = require("firebase-admin")

const serviceAccount = require("./beejobs-ee60a-firebase-adminsdk-j4hbc-49478aa2a5.json")

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  
})

module.exports = {firebase};

