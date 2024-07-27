var db = require("../config/db");
const JobFollow = new db.mongoose.Schema(
  {
    userId: { type: String, required: true },
    jobsId: { type: [String], default: [] }
  },
  {
    collection: "JobFollow",
  }
);

const JobFollows = db.mongoose.model("JobFollow", JobFollow);

module.exports = { JobFollows };
