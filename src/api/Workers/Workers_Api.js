const WorkerMD = require('../../model/Workers');

exports.create_Workers = async (req, res) => {
    if (req.method === "POST") {
        let user_id = req.params.user_id;
        let worker = new WorkerMD({
            user_id: user_id,
            worker_name: req.body.worker_name,
            education: req.body.education,
            skills: req.body.skills,
            certificate: req.body.certificate,
            hobbies: req.body.hobbies,
            experience: req.body.experience,
            age: req.body.age,
            address: req.body.address
        });

        try {
            await worker.save();
            let { user_id, worker_name, education, skills, certificate, hobbies, experience, age, address } = worker; // Destructuring
            return res.status(200).json({
                dataPost: {
                    user_id, worker_name, education, skills, certificate, hobbies, experience, age, address
                },
                message: "Tạo hồ sơ NLĐ thành công",
                createdBy: "Sơn"
            });
        } catch (error) {
            console.error("Error saving worker:", error);
            return res.status(500).json({
                message: "Failed: " + error.message,
                createdBy: "Sơn"
            });
        }
    } else {
        return res.status(405).json({
            message: "Phương thức không được hỗ trợ, hãy sử dụng: POST",
            createdBy: "Sơn"
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
                        education: req.body.education,
                        skills: req.body.skills,
                        certificate: req.body.certificate,
                        hobbies: req.body.hobbies,
                        experience: req.body.experience,
                        age: req.body.age,
                        address: req.body.address
                    };

                    const checkEdit = await WorkerMD.findByIdAndUpdate(worker_id, update_worker, { new: true }); // Thêm { new: true }
                    if (checkEdit) {
                        let { worker_name, education, skills, certificate, hobbies, experience, age, address } = update_worker; // destructuring
                        return res.status(200).json({
                            dataUpdated: { worker_name, education, skills, certificate, hobbies, experience, age, address },
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

exports.getListWorkersByUserId = async (req, res) => {
    if (req.method === "GET") {
        try {
            let user_id = req.params.user_id;
            const listWorkers = await WorkerMD.find({ user_id: user_id });
            if (listWorkers.length > 0) {
                let listResult = [];
                listWorkers.forEach(worker => {
                    let { worker_name, education, skills, certificate, hobbies, experience, age, address } = worker;
                    listResult.push({ worker_name, education, skills, certificate, hobbies, experience, age, address });
                });
                return res.status(200).json({
                    data: listResult,
                    message: "Lấy danh sách workers theo user_id thành công!",
                    createdBy: "Sơn"
                });
            }
            return res.status(404).json({
                message: "Không có hồ sơ của người dùng có id: " + user_id,
                createdBy: "Sơn"
            });
        } catch (error) {
            return res.status(500).json({
                message: "Lỗi: " + error.message,
                createdBy: "Sơn"
            });
        }
    } else {
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

