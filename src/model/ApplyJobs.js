var db = require("../config/db");
const applyJobSchema = new db.mongoose.Schema(
  {
    worker_id: { type: db.mongoose.Schema.Types.ObjectId, ref: "WorkerMD" },
    job_id: { type: db.mongoose.Schema.Types.ObjectId, ref: "jobModel" },
    status: { type: String, require: true },
    applied_at: { type: Date, require: true },
  },
  {
    collection: "ApplyJobs",
  }
);

const applyJobModel = db.mongoose.model("applyJobModel", applyJobSchema);

module.exports = { applyJobModel };
