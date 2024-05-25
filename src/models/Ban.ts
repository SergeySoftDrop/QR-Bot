import mongoose, {ObjectId, Schema, model} from "mongoose";

export interface IBan {
    _id: ObjectId,
    userId: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    }
};

const BanSchema = new Schema({
    userId: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    }
});

const Ban = mongoose.model<IBan>('Ban', BanSchema);

export default Ban;