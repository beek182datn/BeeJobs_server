const WorkerMD = require('../../model/Workers');

exports.create_Workers = async (req, res) => {
    if (req.method == "POST") {
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
                data: {
                    user_id, worker_name, education, skills, certificate, hobbies, experience, age, address
                },
                msg: "Tạo hồ sơ NLĐ thành công",
                success: true
            });
        } catch (error) {
            console.log("Lỗi xảy ra khi tạo hồ sơ NLĐ " + error);
            return res.status(500).json({
                data: null,
                msg: "Đăng ký tài khoản thất bại!",
                success: false
            });
        }
    }
};
