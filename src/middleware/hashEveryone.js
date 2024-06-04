var bcrypt = require('bcrypt');
const saltRounds = 10;

const hashPassword = async (plainPassword) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plainPassword, salt);
    return hash;
  }


  const checkPassword = async (plainPassword, hashedPassword) => {
    try {
      const match = await bcrypt.compare(plainPassword, hashedPassword);
      return match;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  module.exports = {checkPassword,hashPassword};