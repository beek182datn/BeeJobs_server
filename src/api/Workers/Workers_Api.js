const WorkerMD = require('../../model/Workers');

exports.create_Workers = async (req, res) => {
    if (req.method === "POST") {
        let worker = new WorkerMD({
            user_id: req.body.user_id,
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
            let { user_id, worker_name, education, skills, certificate, hobbies, experience, age, address } = worker; //destructuring
            return res.status(200).json({
                dataPost: {
                    user_id, worker_name, education, skills, certificate, hobbies, experience, age, address
                },
                message: "Tạo hồ sơ NLĐ thành công",
                createdBy: "Sơn"
            });
        } catch (error) {
            return res.status(500).json({
                message: "Failed: " + error,
                createdBy: "Sơn"
            });
        }
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

