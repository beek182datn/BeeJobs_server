var db = require("../config/db");
const moment = require('moment-timezone');
const applyJobSchema = new db.mongoose.Schema(
  {
    worker_id: { type: db.mongoose.Schema.Types.ObjectId, ref: "WorkerMD" },
    job_id: { type: db.mongoose.Schema.Types.ObjectId, ref: "jobModel" },
    cv: { type: String, require: true },
    fullname: { type: String, require: true },
    phone_number: { type: String, require: true },
    intro_letter: { type: String, require: true },
    status: { type: String, require: true },
    applied_at: { type: Date, 
      require: true,
      get: function(date) {
        if (date) {
          return moment(date).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD');
        }
        return date;
      },
      set: function(date) {
        return moment.tz(date, 'Asia/Ho_Chi_Minh').toDate();
      } },
  },
  {
    collection: "ApplyJobs",
  }
);

const applyJobModel = db.mongoose.model("applyJobModel", applyJobSchema);

module.exports = { applyJobModel };
