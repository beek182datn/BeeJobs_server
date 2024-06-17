var db = require("../config/db");
const companySchema = new db.mongoose.Schema(
  {
    user_id: { type: db.mongoose.Schema.Types.ObjectId, ref: "userModel" },
    company_name: { type: String, require: true },
    company_address: { type: String, require: true },
    company_logo: { type: String, require: false },
    company_scale: { type: String, require: false },
    company_website: { type: String, require: false },
    company_certification: { type: String, require: true },
    taxcode: { type: String, require: true },
    active: { type: Boolean, require: true },
    updated_at: { type: Date },
    created_at: { type: Date, require: true },
  },
  {
    collection: "Companies",
  }
);

const companyModel = db.mongoose.model("companyModel", companySchema);

module.exports = { companyModel };
