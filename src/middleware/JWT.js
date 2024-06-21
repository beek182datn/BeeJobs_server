const crypto = require('crypto');
const { verifyOtp } = require('./MailerSevice');
require('dotenv').config();

const base64url = (str) => {
    return Buffer.from(str).toString('base64')
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

const setTokenData = (user,Role) => {
    const header = {
        alg: "HS256",
        typ: "JWT"
    }

    const payload = {
        sub: user._id,
        Role: Role,
        verify: user.verify,
        exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    }
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(payload));
    const tokenData = `${encodedHeader}.${encodedPayload}`;
    const signature = createJWT(tokenData)
    const token = `${tokenData}.${signature}`;

   return token;
}


const createJWT = (tokenData) =>{
  

    const hmac = crypto.createHmac("sha256", process.env.JWT_secret);
    const signature = hmac.update(tokenData).digest("base64url")
    

    return signature;
}



const checkJWT = (tokenAuth) => {
    const [encodedHeader, encodedPayload, signature] = tokenAuth.split(".");
    const tokenData = `${encodedHeader}.${encodedPayload}`;
    const newSignature = createJWT(tokenData);
  
    if (newSignature === signature) {
      const payload = JSON.parse(atob(encodedPayload));
      const currentTime = Math.floor(Date.now() / 1000);
  
      if (payload.exp && currentTime > payload.exp) {
        // Token hết hạn
        return { isValid: false, message: "Token đã hết hạn" };
      } else {
        // Token hợp lệ
        return { isValid: true, payload };
      }
    } else {
      // Token không hợp lệ
      return { isValid: false, message: "Token không hợp lệ" };
    }
  };


const jwtMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    
    const token = setTokenData(req.user,req.Role);
    req.token = token;
    next();
}

module.exports = {jwtMiddleware,createJWT,checkJWT};
// module.exports = createJWT;
