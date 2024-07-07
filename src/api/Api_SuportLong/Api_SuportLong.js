const { applyJobModel } = require("../../model/ApplyJobs");

exports.checkApplyJobs = async (req, res) => {
    let worker_id = req.params.worker_id;
    let job_id = req.params.job_id;
    if (req.method === "GET") {
        try {
            const checkAppliedJob = await applyJobModel.find({ worker_id: worker_id, job_id: job_id });
            if (checkAppliedJob && checkAppliedJob.length > 0) {
                return res.status(200).json({
                    data: checkAppliedJob,
                    isApplied: true,
                    msg: "Người dùng đã ứng tuyển hồ sơ này!"
                });
            } else {
                return res.status(200).json({
                    data: null,
                    isApplied: false,
                    msg: "Người dùng chưa ứng tuyển hồ sơ này!"
                });
            }
        } catch (error) {
            return res.status(500).json({
                data: null,
                isApplied: false,
                msg: `Sever Error: Lỗi nhập sai worker_id hoặc job_id: ${worker_id}, job_id: ${job_id}`, error,
            });
        }
    } else {
        return res.status(405).json({
            message: "Phương thức không được hỗ trợ, hãy sử dụng: GET!",
            createdBy: "Sơn"
        });
    }
}
