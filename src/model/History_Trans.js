var db = require("../config/db");
const historyTransSchema = new db.mongoose.Schema(
  {
    company_id: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: "companyModel",
    },
    amount: { type: Number, require: true },
    currency: { type: String, require: true },
    status: { type: String, require: true },
    transaction_date: { type: Date, require: true },
  },
  {
    collection: "HistoryTrans",
  }
);

const historyTransModel = db.mongoose.model(
  "historyTransModel",
  historyTransSchema
);

module.exports = { historyTransModel };
