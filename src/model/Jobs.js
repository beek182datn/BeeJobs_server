var db = require("../config/db");
const jobSchema = new db.mongoose.Schema(
  {
    company_id: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: "companyModel",
    },
    title: { type: String, require: true },
    desc: { type: String, require: true },
    form: { type: String, require: true },
    number_of_recruitments: { type: String, require: true },
    requirements: { type: String, require: true },
    salary: { type: String, require: true },
    benefits: { type: String, require: true },
    location: { type: String, require: true },
    deadline: { type: String, require: true },
    created_at: { type: Date, require: true },
    updated_at: { type: Date, require: true },
  },
  {
    collection: "Jobs",
  }
);

const jobModel = db.mongoose.model("jobModel", jobSchema);

module.exports = { jobModel };
