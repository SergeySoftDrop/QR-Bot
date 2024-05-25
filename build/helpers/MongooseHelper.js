import mongoose from "mongoose";
class MongooseHelper {
    static async connect(connectString) {
        await mongoose.connect(connectString);
    }
    static async paginate(model, page = 1, limit = 10, query = {}, sort = { _id: 1 }) {
        const skip = (page - 1) * limit;
        const results = await model.find(query).sort(sort).skip(skip).limit(limit);
        const totalDocuments = await model.countDocuments(query);
        const totalPages = Math.ceil(totalDocuments / limit);
        return {
            results,
            currentPage: page,
            totalPages,
            totalDocuments,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }
}
export default MongooseHelper;
//# sourceMappingURL=MongooseHelper.js.map