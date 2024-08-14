const WorkerMD = require('../../model/Workers');
const fs = require('fs');
const path = require('path');

exports.create_Workers = async (req, res) => {
    if (req.method === "POST") {
        try {
            let user_id = req.params.user_id;
            let url_avatar = "http://beejobs.io.vn:14307/uploads/company_logo_outline.jpg"; // Đường dẫn ảnh đại diện mặc định

            // Xử lý file ảnh đại diện của worker nếu có
            if (req.file["worker_avatar"]) {
                const avatarFile = req.files["company_logo"][0];
                const newPathAvatar = path.join("./public/uploads/", avatarFile.filename);
                fs.renameSync(avatarFile.path, newPathAvatar); // Di chuyển file đến thư mục public
                url_avatar = "/uploads/" + avatarFile.filename;
            }

            // Tạo mới đối tượng worker
            let worker = new WorkerMD({
                user_id: user_id,
                worker_name: req.body.worker_name,
                worker_avatar: url_avatar,
                phone: req.body.phone,
                email: req.body.email,
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


exports.edit_Workers = async (req, res) => {
    if (req.method === "PUT") {
        try {
            const worker_id = req.params.worker_id.trim(); // Loại bỏ các ký tự không hợp lệ
            const user_id = req.params.user_id.trim(); // Loại bỏ các ký tự không hợp lệ

            let checkWorker = await WorkerMD.findOne({ _id: worker_id });
            if (checkWorker) {
                if (checkWorker.user_id == user_id) { // Sử dụng checkWorker
                    const update_worker = {
                        worker_name: req.body.worker_name,
                        worker_avatar: req.body.worker_avatar,
                        phone: req.body.phone,
                        email: req.body.email
                    };

                    const checkEdit = await WorkerMD.findByIdAndUpdate(worker_id, update_worker, { new: true }); // Thêm { new: true }
                    if (checkEdit) {
                        let { worker_name, worker_avatar, phone, email } = update_worker; // destructuring
                        return res.status(200).json({
                            dataUpdated: { worker_name, worker_avatar, phone, email },
                            message: "Cập nhật hồ sơ NLĐ tại bảng Workers thành công!",
                            createdBy: "Sơn"
                        });
                    } else {
                        return res.status(500).json({
                            message: "Không thể cập nhật hồ sơ!",
                            createdBy: "Sơn"
                        });
                    }
                } else {
                    return res.status(403).json({
                        message: "Hồ sơ chỉ được chỉnh sửa bởi người tạo!",
                        createdBy: "Sơn"
                    });
                }
            } else {
                return res.status(404).json({
                    message: "Hồ sơ không tồn tại!",
                    createdBy: "Sơn"
                });
            }
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi: " + error.message,
                createdBy: "Sơn"
            });
        }
    } else {
        return res.status(405).json({
            message: "Phương thức không được hỗ trợ, hãy sử dụng: PUT!",
            createdBy: "Sơn"
        });
    }
};

exports.getListWorkerByIdUser = async (req, res) => {
    if (req.method === "GET") {
        try {
            let user_id = req.params.user_id;
            const listWorkers = await WorkerMD.findOne({ user_id: user_id });
            if (listWorkers && listWorkers.length > 0) {
                let listWorkersResult = listWorkers.map(worker => {
                    let { user_id, worker_name, worker_avatar, phone, email } = worker;
                    return { user_id, worker_name, worker_avatar, phone, email };
                });
                return res.status(200).json({
                    data: listWorkersResult,
                    msg: "Lấy danh sách hồ sơ ứng tuyển thành công!"
                });
            } else {
                return res.status(404).json({
                    message: "Danh sách hồ sơ ứng tuyển trống!",
                    createdBy: "Sơn"
                });
            }
        } catch (error) {
            console.error(error); // Using console.error for logging errors
            return res.status(500).json({
                data: null,
                msg: "Server Error: Xảy ra khi lấy ds hồ sơ ứng tuyển theo user_id",
                success: false
            });
        }
    } else {
        return res.status(405).json({
            message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
            createdBy: "Sơn"
        });
    }
}

exports.getInforWorker = async (req, res) => {
    if (req.method === "GET") {
        try {
            let user_id = req.params.user_id; // Lấy worker_id từ request params

            // Tìm kiếm thông tin worker bằng worker_id
            const findWorker = await WorkerMD.findOne({ user_id: user_id });

            if (findWorker) {
                // Nếu tìm thấy worker, trả về thông tin cần thiết
                let {_id, user_id, worker_name, worker_avatar, phone, email, major, experience, address } = findWorker;
                return res.status(200).json({
                    worker_info: {_id, user_id ,worker_name, worker_avatar, phone, email, major, experience, address },
                    message: "Lấy thông tin worker thành công!",
                    createdBy: "Sơn"
                });
            } else {
                // Nếu không tìm thấy worker, trả về mã lỗi 404
                return res.status(404).json({
                    message: "Không tìm thấy worker",
                    createdBy: "Sơn"
                });
            }
        } catch (error) {
            // Bắt lỗi nếu có vấn đề xảy ra trong quá trình tìm kiếm
            return res.status(500).json({
                message: "Lỗi: " + error.message,
                createdBy: "Sơn"
            });
        }
    } else {
        // Trả về mã lỗi 405 nếu phương thức request không phải là GET
        return res.status(405).json({
            message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
            createdBy: "Sơn"
        });
    }
};

exports.deleteWorker = async (req, res) => {
    if (req.method === "DELETE") {
        try {
            const worker_id = req.params.worker_id.trim(); // Loại bỏ các ký tự không hợp lệ
            const user_id = req.params.user_id.trim(); // Loại bỏ các ký tự không hợp lệ

            const thisWorker = await WorkerMD.findOne({ _id: worker_id });
            if (!thisWorker) {
                return res.status(404).json({
                    message: "Không tìm thấy worker có id: " + worker_id,
                    createdBy: "Sơn"
                });
            } else {
                if (thisWorker.user_id != user_id) {
                    return res.status(403).json({
                        message: "Không có quyền xóa hồ sơ này, ko phải người tạo",
                        createdBy: "Sơn"
                    });
                } else {
                    const deleteResult = await WorkerMD.deleteOne({ _id: worker_id });
                    if (deleteResult.deletedCount > 0) {
                        return res.status(200).json({
                            message: "Xóa thành công hồ sơ có id: " + worker_id,
                            createdBy: "Sơn"
                        });
                    } else {
                        return res.status(500).json({
                            message: "Xóa hồ sơ thất bại, vui lòng thử lại.",
                            createdBy: "Sơn"
                        });
                    }
                }
            }
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi: " + error.message,
                createdBy: "Sơn"
            });
        }
    } else {
        return res.status(405).json({
            message: "Phương thức không được hỗ trợ, hãy sử dụng: DELETE!",
            createdBy: "Sơn"
        });
    }
};

