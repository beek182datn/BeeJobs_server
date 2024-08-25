var db = require("../config/db");
const moment = require('moment-timezone');
const historyTransSchema = new db.mongoose.Schema(
  {
    company_id: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: "companyModel",
    },
    amount: { type: Number, require: true },
    currency: { type: String, require: true },
    status: { type: String, require: true },
    transaction_date: { 
      type: Date, 
      require: true,
      get: function(date) {
        if (date) {
          return moment(date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
        }
        return date;
      },
      set: function(date) {
        return moment.tz(date, 'Asia/Ho_Chi_Minh').toDate();
      }
    },

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
