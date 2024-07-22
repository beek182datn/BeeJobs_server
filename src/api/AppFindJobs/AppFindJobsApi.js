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

exports.checkIsFolowing = async (req, res) =>{
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
