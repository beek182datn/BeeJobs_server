const db = require("../config/db");

const workerSchema = new db.mongoose.Schema(
  {
    user_id: { type: String, required: true },
    worker_name: { type: String, required: true },
    worker_avatar: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
}, {
    collection: 'Workers'
});

const WorkerMD = db.mongoose.model("WorkerMD", workerSchema);
module.exports = WorkerMD;
