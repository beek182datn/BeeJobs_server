const CompanyMD = require('../model/Companies');
const JobsMD = require('../model/Jobs');
const ApplyJobs = require('../model/ApplyJobs');
const {historyTransModel} = require('../model/History_Trans');
const { log } = require('winston');
const { Console } = require('winston/lib/winston/transports');

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

         // Lấy dữ liệu doanh nghiệp theo từng tháng của tất cả các năm
         const companyGrowthByYearRaw = await CompanyMD.companyModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$created_at" },
                        month: { $month: "$created_at" }
                    },
                    value: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        const companyGrowthByYear = companyGrowthByYearRaw.map(item => ({
            month: `Năm ${item._id.year}`,
            year: item._id.year,
            value: item.value
        }));

        data.companyGrowthByYear = companyGrowthByYear;


       

          // Lấy số tin tuyển dụng theo tháng trong tất cả các năm
const jobsCountRawByYearRaw = await JobsMD.jobModel.aggregate([
    {
        $group: {
            _id: {
                year: { $year: "$created_at" },
                month: { $month: "$created_at" }
            },
            jobCount: { $sum: 1 }
        }
    },
    {
        $sort: { "_id.year": 1, "_id.month": 1 }
    }
]);

// Lấy số hồ sơ ứng tuyển theo tháng trong tất cả các năm
const applicationsCountRaw = await ApplyJobs.applyJobModel.aggregate([
    {
        $group: {
            _id: {
                year: { $year: "$applied_at" },
                month: { $month: "$applied_at" }
            },
            applyCount: { $sum: 1 }
        }
    },
    {
        $sort: { "_id.year": 1, "_id.month": 1 }
    }
]);

// Tạo đối tượng chứa dữ liệu tổng hợp theo năm và tháng
const jobsAndApplicationsData = jobsCountRawByYearRaw.map(item => ({
    year: item._id.year,
    month: `Năm ${item._id.year}`,
    TinTuyen: item.jobCount || 0,
    UngTuyen: 0 // Sẽ cập nhật từ applicationsCountRaw
}));

// Điền dữ liệu hồ sơ ứng tuyển vào đối tượng
applicationsCountRaw.forEach(appItem => {
    const match = jobsAndApplicationsData.find(jobItem =>
        jobItem.year === appItem._id.year && jobItem.month === `Năm ${appItem._id.year}`
    );
    if (match) {
        match.UngTuyen = appItem.applyCount;
    } else {
        jobsAndApplicationsData.push({
            year: appItem._id.year,
            month: `Năm ${appItem._id.year}`,
            TinTuyen: 0,
            UngTuyen: appItem.applyCount
        });
    }
});











        // // Lấy số tin tuyển dụng theo tháng trong năm hiện tại
        // const jobsCountRaw = await JobsMD.jobModel.aggregate([
        //     {
        //         $match: {
        //             created_at: {
        //                 $gte: new Date(`${currentYear}-01-01`),
        //                 $lte: new Date(`${currentYear}-12-31`)
        //             }
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: { $month: "$created_at" },
        //             jobCount: { $sum: 1 }
        //         }
        //     },
        //     {
        //         $sort: { "_id": 1 }
        //     }
        // ]);

        // // Lấy số hồ sơ ứng tuyển theo tháng trong năm hiện tại
        // const applicationsCountRaw = await ApplyJobs.applyJobModel.aggregate([
        //     {
        //         $match: {
        //             applied_at: {
        //                 $gte: new Date(`${currentYear}-01-01`),
        //                 $lte: new Date(`${currentYear}-12-31`)
        //             }
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: { $month: "$applied_at" },
        //             applyCount: { $sum: 1 }
        //         }
        //     },
        //     {
        //         $sort: { "_id": 1 }
        //     }
        // ]);

        // const jobsAndApplicationsData = Array.from({ length: 12 }, (v, k) => ({
        //     month: `Tháng ${k + 1}`,
        //     TinTuyen: 0,
        //     UngTuyen: 0
        // }));

        // // Điền dữ liệu từ kết quả truy vấn vào đối tượng
        // jobsCountRaw.forEach(item => {
        //     jobsAndApplicationsData[item._id - 1].TinTuyen = item.jobCount;
        // });

        // applicationsCountRaw.forEach(item => {
        //     jobsAndApplicationsData[item._id - 1].UngTuyen = item.applyCount;
        // });





        
        const moneyDepositsRaw = await historyTransModel.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$transaction_date" },
                        month: { $month: "$transaction_date" }
                    },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);
        
        const moneyDeposits = moneyDepositsRaw.map(item => ({
            month: `Năm ${item._id.year}`,
            totalAmount: item.totalAmount || 0,
            year: item._id.year,
        }));
        
        console.log(moneyDeposits);
        
      
     



        

 // New aggregation for successful applications vs total applications
 const applicationsStatsRaw = await ApplyJobs.applyJobModel.aggregate([
{
        $group: {
            _id: {
                year: { $year: "$applied_at" },
                month: { $month: "$applied_at" }
            },
            totalApplications: { $sum: 1 },
            successfulApplications: {
                $sum: {
                    $cond: [{ $eq: ["$status", "Phù hợp"] }, 1, 0]
                }
            }
        }
    },
    {
        $sort: { "_id.year": 1, "_id.month": 1 }
    }
]);



const applicationsStats = applicationsStatsRaw.map(item => ({
    year: item._id.year,
    month: `Năm ${item._id.year}`,
    TongUngTuyen: item.totalApplications || 0,
    UngTuyenThanhCong: item.successfulApplications || 0 // Sẽ cập nhật từ applicationsCountRaw
}));
// Fill data from query result into the object


// Add applications stats data to the main data object
// data.applicationsStats = applicationsStats;

        // Add money deposits data to the main data object
        data.moneyDeposits = moneyDeposits;

        data.companyGrowth = companyGrowth;
        data.applicationsStats = applicationsStats;
        data.jobsAndApplicationsData = jobsAndApplicationsData;
        console.log('====================================');
        console.log(data);
        console.log('====================================');

        res.render("../views/Dashboard/index.ejs", { data });
    } catch (error) {
        next(error);
    }
};
exports.getYearData = async (req, res, next) => {
    try {
        const selectedYear = parseInt(req.params.selectedYear);

        // Lấy dữ liệu doanh nghiệp theo tháng trong năm cụ thể (năm được chọn)
        const companyGrowthCurrentYearRaw = await CompanyMD.companyModel.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(`${selectedYear}-01-01`),
                        $lte: new Date(`${selectedYear}-12-31`)
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

        const companyGrowthCurrentYear = Array.from({ length: 12 }, (v, k) => ({
            month: `Tháng ${k + 1}`,
            value: 0
        }));

        companyGrowthCurrentYearRaw.forEach(item => {
            companyGrowthCurrentYear[item._id - 1].value = item.value;
        });
        console.log(companyGrowthCurrentYear,"getyear")
        res.json(companyGrowthCurrentYear);
    } catch (error) {
        next(error);
    }
};

exports.getJobDataByYear = async (req, res, next) => {
    try {
        const selectedYear = parseInt(req.params.selectedYear);

         // Lấy số tin tuyển dụng theo tháng trong năm hiện tại
         const jobsCountRaw = await JobsMD.jobModel.aggregate([
            {
                $match: {
                    created_at: {
                        $gte: new Date(`${selectedYear}-01-01`),
                        $lte: new Date(`${selectedYear}-12-31`)
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
                        $gte: new Date(`${selectedYear}-01-01`),
                        $lte: new Date(`${selectedYear}-12-31`)
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



        res.json(jobsAndApplicationsData);
    } catch (error) {
        next(error);
    }
};

exports.getApplicationDataByYear = async (req, res, next) => {
    try {
        const selectedYear = parseInt(req.params.selectedYear);

        // Lấy dữ liệu ứng tuyển theo tháng trong năm cụ thể (năm được chọn)
        const applicationsCountCurrentYearRaw = await ApplyJobs.applyJobModel.aggregate([
            {
                $match: {
                    applied_at: {
                        $gte: new Date(`${selectedYear}-01-01`),
                        $lte: new Date(`${selectedYear}-12-31`)
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
       applicationsCountCurrentYearRaw.forEach(item => {
    applicationsStats[item._id - 1].TongUngTuyen = item.totalApplications;
    applicationsStats[item._id - 1].UngTuyenThanhCong = item.successfulApplications;
});

        res.json(applicationsStats);
    } catch (error) {
        next(error);
    }
};

exports.getMoneyDepositsByYear = async (req, res, next) => {
    try {
        const selectedYear = parseInt(req.params.selectedYear);

        const moneyDepositsRaw = await historyTransModel.aggregate([
            {
                $match: {
                    transaction_date: {
                        $gte: new Date(`${selectedYear}-01-01`),
                        $lte: new Date(`${selectedYear}-12-31`)
                    },
                    amount: { $gt: 0 } 
                }
            },
            {
                $group: {
                    _id: { $month: "$transaction_date" },
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


        res.json(moneyDeposits);
    } catch (error) {
        next(error);
    }
};


exports.getMoneyDepositsByDateRange = async (req, res, next) => {
    try {
        let { startDate, endDate } = req.params;

        // Nếu không có startDate và endDate, sẽ lấy tháng hiện tại
        const currentDate = new Date();
        if (!startDate || !endDate) {
            const currentMonth = currentDate.getMonth();
            startDate = new Date(currentDate.getFullYear(), currentMonth, 1);
            endDate = new Date(currentDate.getFullYear(), currentMonth + 1, 0);
        } else {
            startDate = new Date(`${startDate}`);
            endDate = new Date(`${endDate}`);
        }

        const moneyDepositsRaw = await historyTransModel.aggregate([
            {
                $match: {
                    transaction_date: {
                        $gte: startDate,
                        $lte: endDate
                    },
                    amount: { $gt: 0 } 
                }
            },
            {
                $group: {
                    _id: { 
                        year: { $year: "$transaction_date" },
                        month: { $month: "$transaction_date" },
                        day: { $dayOfMonth: "$transaction_date" }
                    },
                    totalAmount: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            }
        ]);

        // Chuẩn bị dữ liệu đầu ra
        const moneyDeposits = [];
        let currentDateIter = new Date(startDate);
        
        while (currentDateIter <= endDate) {
            const year = currentDateIter.getFullYear();
            const month = currentDateIter.getMonth() + 1; // Tháng tính từ 0, nên cần cộng thêm 1
            const day = currentDateIter.getDate();

            const existingRecord = moneyDepositsRaw.find(item => 
                item._id.year === year && item._id.month === month && item._id.day === day
            );

            // Chuyển đổi date thành dạng dd/mm/yyyy
            const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

            moneyDeposits.push({
                month: formattedDate,
                totalAmount: existingRecord ? existingRecord.totalAmount : 0
            });

            // Chuyển sang ngày tiếp theo
            currentDateIter.setDate(currentDateIter.getDate() + 1);
        }

        res.json(moneyDeposits);
    } catch (error) {
        next(error);
    }
};

