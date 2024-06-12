const { companyModel } = require("../../model/Companies");

var fs = require("fs");
const path = require("path");

exports.create_company = async (req, res) => {
  if (req.method === "POST") {
    try {
      // Kiểm tra xem accout_id đã tồn tại chưa
      const existingCompany = await companyModel.findOne({
        user_id: req.params.user_id,
      });
      if (existingCompany) {
        return res.status(400).json({
          message: "Công ty với accout_id này đã tồn tại",
          createdBy: "Hệ thống",
        });
      }

      // Nếu accout_id chưa tồn tại, tiến hành tạo mới
      let url_logo =
        "http://beejobs.io.vn:14307/uploads/company_logo_outline.jpg";
      let url_certificate = "";

      if (req.files["company_logo"]) {
        const logoFile = req.files["company_logo"][0];
        const newPathLogo = path.join("./public/uploads/", logoFile.filename);
        fs.renameSync(logoFile.path, newPathLogo);
        url_logo = "/uploads/" + logoFile.filename;
      }

      if (req.files["company_certification"]) {
        const certificateFile = req.files["company_certification"][0];
        const newPathCertificate = path.join(
          "./public/uploads/",
          certificateFile.filename
        );
        fs.renameSync(certificateFile.path, newPathCertificate);
        url_certificate = "/uploads/" + certificateFile.filename;
      }
      let company = new companyModel({
        user_id: req.params.user_id,
        company_name: req.body.company_name,
        company_address: req.body.company_address,
        company_scale: req.body.company_scale,
        company_website: req.body.company_website,
        company_certification: url_certificate,
        company_logo: url_logo,
        taxcode: req.body.taxcode,
        active: req.body.active,
        updated_at: new Date(),
        created_at: new Date(),
      });

      await company.save();
      let {
        user_id,
        company_name,
        company_address,
        company_website,
        company_scale,
        company_certification,
        company_logo,
        taxcode,
        active,
        updated_at,
        created_at,
      } = company; // Destructuring
      return res.status(200).json({
        dataPost: {
          user_id,
          company_name,
          company_address,
          company_website,
          company_scale,
          company_certification,
          company_logo,
          taxcode,
          active,
          updated_at,
          created_at,
        },
        message: "Tạo công ty thành công",
        createdBy: "Hệ thống",
      });
    } catch (error) {
      console.error("Error saving company:", error);
      return res.status(500).json({
        message: "Failed: " + error.message,
        createdBy: "Hệ thống",
      });
    }
  } else {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: POST",
      createdBy: "Hệ thống",
    });
  }
};

exports.edit_company = async (req, res) => {
  if (req.method !== "PUT") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: PUT!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const company_id = req.params.company_id;
    const user_id = req.params.user_id;

    // Kiểm tra sự tồn tại của công ty
    let checkCompany = await companyModel.findOne({ _id: company_id });
    if (!checkCompany) {
      return res.status(404).json({
        message: "Thông tin công ty không tồn tại!",
        createdBy: "Hệ thống",
      });
    }

    // Kiểm tra quyền sở hữu
    if (checkCompany.user_id.toString() !== user_id) {
      return res.status(403).json({
        message: "Thông tin công ty chỉ được chỉnh sửa bởi người tạo!",
        createdBy: "Hệ thống",
      });
    }

    let url_logo = checkCompany.company_logo;
    let url_certificate = checkCompany.company_certification;
    if (req.files["company_logo"]) {
      const logoFile = req.files["company_logo"][0];
      const newPathLogo = path.join("./public/uploads/", logoFile.filename);
      fs.renameSync(logoFile.path, newPathLogo);
      url_logo = "/uploads/" + logoFile.filename;
    }

    if (req.files["company_certification"]) {
      const certificateFile = req.files["company_certification"][0];
      const newPathCertificate = path.join(
        "./public/uploads/",
        certificateFile.filename
      );
      fs.renameSync(certificateFile.path, newPathCertificate);
      url_certificate = "/uploads/" + certificateFile.filename;
    }

    // Cập nhật thông tin công ty
    const updateFields = {
      company_name: req.body.company_name,
      company_address: req.body.company_address,
      company_logo: url_logo,
      company_scale: req.body.company_scale,
      company_website: req.body.company_website,
      company_certification: url_certificate,
      taxcode: req.body.taxcode,
      active: req.body.active,
      updated_at: new Date(),
    };

    const checkEdit = await companyModel.findByIdAndUpdate(
      company_id,
      updateFields,
      { new: true }
    );

    if (!checkEdit) {
      return res.status(500).json({
        message: "Không thể cập nhật thông tin công ty!",
        createdBy: "Hệ thống",
      });
    }

    let {
      company_name,
      company_address,
      company_logo,
      company_website,
      company_scale,
      company_certification,
      taxcode,
      active,
      updated_at,
      created_at,
    } = checkEdit;
    return res.status(200).json({
      dataUpdated: {
        company_name,
        company_address,
        company_logo,
        company_website,
        company_scale,
        company_certification,
        taxcode,
        active,
        updated_at,
        created_at,
      },
      message: "Cập nhật thông tin công ty thành công!",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.edit_company_logo = async (req, res) => {
  if (req.method !== "PUT") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: PUT!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const company_id = req.params.company_id;
    const user_id = req.params.user_id;

    // Kiểm tra sự tồn tại của công ty
    let checkCompany = await companyModel.findOne({ _id: company_id });
    if (!checkCompany) {
      return res.status(404).json({
        message: "Thông tin công ty không tồn tại!",
        createdBy: "Hệ thống",
      });
    }

    // Kiểm tra quyền sở hữu
    if (checkCompany.user_id.toString() !== user_id) {
      return res.status(403).json({
        message: "Thông tin công ty chỉ được chỉnh sửa bởi người tạo!",
        createdBy: "Hệ thống",
      });
    }

    let url_logo = checkCompany.company_logo;

    if (req.files["company_logo"]) {
      const logoFile = req.files["company_logo"][0];
      const newPathLogo = path.join("./public/uploads/", logoFile.filename);
      fs.renameSync(logoFile.path, newPathLogo);
      url_logo = "/uploads/" + logoFile.filename;
    }

    // Cập nhật thông tin công ty chỉ với company_logo
    const updateFields = {
      company_logo: url_logo,
      updated_at: new Date(),
    };

    const checkEdit = await companyModel.findByIdAndUpdate(
      company_id,
      updateFields,
      { new: true }
    );

    if (!checkEdit) {
      return res.status(500).json({
        message: "Không thể cập nhật thông tin công ty!",
        createdBy: "Hệ thống",
      });
    }

    let {
      company_name,
      company_address,
      company_logo,
      company_website,
      company_scale,
      company_certification,
      taxcode,
      active,
      updated_at,
      created_at,
    } = checkEdit;

    return res.status(200).json({
      dataUpdated: {
        company_name,
        company_address,
        company_logo,
        company_website,
        company_scale,
        company_certification,
        taxcode,
        active,
        updated_at,
        created_at,
      },
      message: "Cập nhật thông tin logo công ty thành công!",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getListCompany = async (req, res) => {
  try {
    const companies = await companyModel.find({});
    return res.status(200).json({
      data: companies,
      message: "Danh sách các công ty",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const company_id = req.params.company_id;
    const company = await companyModel.findById(company_id);

    if (!company) {
      return res.status(404).json({
        message: "Thông tin công ty không tồn tại!",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      data: company,
      message: "Thông tin công ty",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.getCompanyByCompanyName = async (req, res) => {
  try {
    const searchKeyword = req.query.keyword || "";

    const query = {};

    if (searchKeyword) {
      query.company_name = { $regex: searchKeyword, $options: "i" };
    }

    const companies = await companyModel.find(query);

    if (!companies || companies.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy công ty nào!",
        createdBy: "Hệ thống",
      });
    }

    return res.status(200).json({
      data: companies,
      message: "Danh sách công ty",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};

exports.delete_company = async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({
      message: "Phương thức không được hỗ trợ, hãy sử dụng: DELETE!",
      createdBy: "Hệ thống",
    });
  }

  try {
    const company_id = req.params.company_id;
    const user_id = req.params.user_id;

    // Kiểm tra sự tồn tại của công ty
    const checkCompany = await companyModel.findById(company_id);
    if (!checkCompany) {
      return res.status(404).json({
        message: "Thông tin công ty không tồn tại!",
        createdBy: "Hệ thống",
      });
    }
    // Kiểm tra quyền sở hữu
    if (checkCompany.user_id.toString() !== user_id) {
      return res.status(403).json({
        message: "Thông tin công ty chỉ được xóa bởi người tạo!",
        createdBy: "Hệ thống",
      });
    }

    // Xóa công ty
    await companyModel.findByIdAndDelete(company_id);

    return res.status(200).json({
      message: "Xóa công ty thành công!",
      createdBy: "Hệ thống",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi: " + error.message,
      createdBy: "Hệ thống",
    });
  }
};
