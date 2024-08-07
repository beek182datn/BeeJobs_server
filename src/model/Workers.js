const db = require("../config/db");

const workerSchema = new db.mongoose.Schema(
  {
    user_id: { type: String, required: true },
    worker_name: { type: String, required: true },
    worker_avatar: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    experience: { type: String, required: false },
    major: { type: String, required: false },
    address: { type: String, required: false },
}, {
    collection: 'Workers'
});

const WorkerMD = db.mongoose.model("WorkerMD", workerSchema);
module.exports = WorkerMD;
