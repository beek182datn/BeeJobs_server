const { FolowerCompany } = require('../../model/FolowerCompany');
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
