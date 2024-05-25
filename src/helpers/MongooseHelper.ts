import mongoose from "mongoose";
import { Model } from 'mongoose';

interface PaginateResult<T> {
    results: T[];
    currentPage: number;
    totalPages: number;
    totalDocuments: number;
    hasNext: boolean;
    hasPrev: boolean;
}

class MongooseHelper {
    public static async connect(connectString: string) {
        await mongoose.connect(connectString);
    }

    public static async paginate<T>(
            model: Model<T>,
            page: number = 1,
            limit: number = 10,
            query: Record<string, any> = {},
            sort: Record<string, 1 | -1> = { _id: 1 }
        ): Promise<PaginateResult<T>> {
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