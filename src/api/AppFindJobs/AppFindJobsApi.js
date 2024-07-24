const { FolowerCompany } = require('../../model/FolowerCompany');
const { userModel } = require('../../model/Users');
const WorkerMD = require('../../model/Workers');
const fs = require('fs');
const path = require('path');

exports.folowCompany = async (req, res) => {
    try {
        const userId = req.params.userId;
        const companyId = req.params.companyId;
        let data = await FolowerCompany.findOne({ userId });
        if (!data) {
            // Nếu người dùng không tồn tại, tạo mới
            data = new FolowerCompany({
                userId,
                companyId: [companyId]
            });
        } else {
            // Nếu người dùng đã tồn tại, thêm companyId vào mảng companyId
            if (!data.companyId.includes(companyId)) {
                data.companyId.push(companyId);
            }
        }
        await data.save();
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
    }
}

exports.checkIsFolowing = async (req, res) => {
    try {
        const userId = req.params.userId;
        const companyId = req.params.companyId;
        const data = await FolowerCompany.findOne({ userId });

        if (data && data.companyId.includes(companyId)) {
            res.status(200).send({ isFollowing: true });
        } else {
            res.status(200).send({ isFollowing: false });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.unFollowCompany = async (req, res) => {
    try {
        const userId = req.params.userId;
        const companyId = req.params.companyId;
        let data = await FolowerCompany.findOne({ userId });

        if (data) {
            // Nếu người dùng tồn tại, loại bỏ companyId khỏi mảng companyId
            data.companyId = data.companyId.filter(id => id !== companyId);
            await data.save();
            res.status(200).send(data);
        } else {
            // Nếu người dùng không tồn tại, trả về lỗi
            res.status(404).send({ error: 'User not found' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.getInfoUser = async (req, res) => {
    try {
        let userId = req.params.userId;

        const user = await userModel.findOne({ _id: userId });
        res.status(200).send({ user, 'message': 'Lấy thông tin thành công' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}


exports.create_Workers = async (req, res) => {
    if (req.method === "POST") {
        try {
            let user_id = req.params.user_id;
            let url_avatar = "http://beejobs.io.vn:14307/uploads/company_logo_outline.jpg"; // Đường dẫn ảnh đại diện mặc định
            console.log(JSON.stringify(req.body))
            console.log(JSON.stringify(req.files["worker_avatar"][0].filename))
            // Xử lý file ảnh đại diện của worker nếu có
            if (req.files["worker_avatar"]) {
                const logoFile = req.files["worker_avatar"][0];

                // Kiểm tra kích thước file (đơn vị: byte)
                const maxSizeInBytes = 1024 * 1024 * 1.5; // 1.5 MB
                if (logoFile.size > maxSizeInBytes) {
                    return res.status(400).json({ message: "File quá lớn. Vui lòng chọn file dưới 1.5MB." });
                }

                const newPathAvatar = path.join("./public/uploads/", logoFile.filename);
                fs.renameSync(logoFile.path, newPathAvatar); // Di chuyển file đến thư mục public
                url_avatar = "/uploads/" + logoFile.filename;
            }

            // Tạo mới đối tượng worker
            let worker = new WorkerMD({
                user_id: user_id,
                worker_name: req.body.worker_name,
                worker_avatar: url_avatar,
                phone: req.body.phone,
                email: req.body.email
            });

            // Lưu worker vào cơ sở dữ liệu
            await worker.save();

            // Phản hồi lại client với thông tin worker mới tạo
            return res.status(200).json({
                data: worker,
                message: "Tạo worker thành công",
                createdBy: "Hệ thống",
            });
        } catch (error) {
            console.error("Error saving worker:", error);
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

exports.update_Workers = async (req, res) => {
    if (req.method === "POST") {
        try {
            let user_id = req.params.user_id;

            // Tìm đối tượng worker theo user_id
            let worker = await WorkerMD.findOne({ user_id: user_id });
            if (!worker) {
                return res.status(404).json({
                    message: "Worker không tồn tại",
                    createdBy: "Hệ thống",
                });
            }

            // Xử lý file ảnh đại diện của worker nếu có
            if (req.files && req.files["worker_avatar"]) {
                const logoFile = req.files["worker_avatar"][0];

                // Kiểm tra kích thước file (đơn vị: byte)
                const maxSizeInBytes = 1024 * 1024 * 1.5; // 1.5 MB
                if (logoFile.size > maxSizeInBytes) {
                    return res.status(400).json({ message: "File quá lớn. Vui lòng chọn file dưới 1.5MB." });
                }

                const newPathAvatar = path.join("./public/uploads/", logoFile.filename);
                fs.renameSync(logoFile.path, newPathAvatar); // Di chuyển file đến thư mục public
                worker.worker_avatar = "/uploads/" + logoFile.filename;
            }

            // Cập nhật thông tin worker
            worker.worker_name = req.body.worker_name || worker.worker_name;
            worker.phone = req.body.phone || worker.phone;
            worker.email = req.body.email || worker.email;

            // Lưu các thay đổi vào cơ sở dữ liệu
            await worker.save();

            // Phản hồi lại client với thông tin worker đã cập nhật
            return res.status(200).json({
                data: worker,
                message: "Cập nhật worker thành công",
                updatedBy: "Hệ thống",
            });
        } catch (error) {
            console.error("Error updating worker:", error);
            return res.status(500).json({
                message: "Failed: " + error.message,
                updatedBy: "Hệ thống",
            });
        }
    } else {
        return res.status(405).json({
            message: "Phương thức không được hỗ trợ, hãy sử dụng: PUT",
            updatedBy: "Hệ thống",
        });
    }
};