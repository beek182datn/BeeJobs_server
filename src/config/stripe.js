const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51Pl6FWENrF9mMyn2s7xrG1alL1LzUM2QtNYDMHxd8jphlDbn7FlnUjeZO6wu6qEtf4Crhy17JWVwPBURj6XSwYTx00SBKN3QyV"
);
module.exports = { stripe };
