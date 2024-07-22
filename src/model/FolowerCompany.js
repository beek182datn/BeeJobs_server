var db = require("../config/db");
const folowerCompanySchema = new db.mongoose.Schema(
  {
    userId: { type: String, required: true },
    companyId: { type: [String], default: [] }
  },
  {
    collection: "FolowerCompany",
  }
);

const FolowerCompany = db.mongoose.model("FolowerCompany", folowerCompanySchema);

module.exports = { FolowerCompany };
