const CompanyMD = require('../model/Companies');
const JobsMD = require('../model/Jobs');
const ApplyJobs = require('../model/ApplyJobs');
const {historyTransModel} = require('../model/History_Trans');
const { log } = require('winston');

exports.index = async (req, res, next) => {
    try {
        const data = {};
        const currentYear = new Date().getFullYear();

        // Lấy số doanh nghiệp theo tháng trong năm hiện tại
        const companyGrowthRaw = await CompanyMD.companyModel.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$created_at" },
                    value: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        const companyGrowth = Array.from({ length: 12 }, (v, k) => ({
            month: `Tháng ${k + 1}`,
            value: 0
        }));

        // Điền dữ liệu từ kết quả truy vấn vào đối tượng
        companyGrowthRaw.forEach(item => {
            companyGrowth[item._id - 1].value = item.value;
        });

        console.log('====================================');
        console.log(companyGrowth);
        console.log('====================================');

        // Lấy số tin tuyển dụng theo tháng trong năm hiện tại
        const jobsCountRaw = await JobsMD.jobModel.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$created_at" },
                    jobCount: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        // Lấy số hồ sơ ứng tuyển theo tháng trong năm hiện tại
        const applicationsCountRaw = await ApplyJobs.applyJobModel.aggregate([
            {
                $match: {
                    applied_at: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$applied_at" },
                    applyCount: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        const jobsAndApplicationsData = Array.from({ length: 12 }, (v, k) => ({
            month: `Tháng ${k + 1}`,
            TinTuyen: 0,
            UngTuyen: 0
        }));

        // Điền dữ liệu từ kết quả truy vấn vào đối tượng
        jobsCountRaw.forEach(item => {
            jobsAndApplicationsData[item._id - 1].TinTuyen = item.jobCount;
        });

        applicationsCountRaw.forEach(item => {
            jobsAndApplicationsData[item._id - 1].UngTuyen = item.applyCount;
        });


        const moneyDepositsRaw = await historyTransModel.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    },
                    status: "Nạp"
                }
            },
            {
                $group: {
                    _id: { $month: "$created_at" },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        const moneyDeposits = Array.from({ length: 12 }, (v, k) => ({
            month: `Tháng ${k + 1}`,
            totalAmount: 0
        }));

        // Fill data from query result into the object
        moneyDepositsRaw.forEach(item => {
            moneyDeposits[item._id - 1].totalAmount = item.totalAmount;
        });


 // New aggregation for successful applications vs total applications
 const applicationsStatsRaw = await ApplyJobs.applyJobModel.aggregate([
    {
        $match: {
            applied_at: {
                $gte: new Date(`${currentYear}-01-01`),
                $lte: new Date(`${currentYear}-12-31`)
            }
        }
    },
    {
        $group: {
            _id: { $month: "$applied_at" },
            totalApplications: { $sum: 1 },
            successfulApplications: {
                $sum: {
                    $cond: [{ $eq: ["$status", "Phù hợp"] }, 1, 0]
                }
            }
        }
    },
    {
        $sort: { "_id": 1 }
    }
]);

const applicationsStats = Array.from({ length: 12 }, (v, k) => ({
    month: `Tháng ${k + 1}`,
    TongUngTuyen: 0,
    UngTuyenThanhCong: 0
}));

// Fill data from query result into the object
applicationsStatsRaw.forEach(item => {
    applicationsStats[item._id - 1].TongUngTuyen = item.totalApplications;
    applicationsStats[item._id - 1].UngTuyenThanhCong = item.successfulApplications;
});

// Add applications stats data to the main data object
data.applicationsStats = applicationsStats;

        // Add money deposits data to the main data object
        data.moneyDeposits = moneyDeposits;

        data.companyGrowth = companyGrowth;
        data.jobsAndApplications = jobsAndApplicationsData;

        console.log('====================================');
        console.log(data);
        console.log('====================================');

        res.render("../views/Dashboard/index.ejs", { data });
    } catch (error) {
        next(error);
    }
};
