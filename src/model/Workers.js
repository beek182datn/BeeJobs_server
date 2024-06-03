const db = require("../config/db");

const workerSchema = new db.mongoose.Schema({
    user_id: { type: String, required: true },
    worker_name: { type: String, required: true },
    education: { type: String, required: true },
    skills: { type: String, required: true },
    certificate: { type: String, required: true },
    hobbies: { type: String, required: true },
    experience: { type: String, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
}, {
    collection: 'Workers'
});

const WorkerMD = db.mongoose.model("WorkerMD", workerSchema);
module.exports = WorkerMD;
