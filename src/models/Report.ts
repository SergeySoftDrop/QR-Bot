import mongoose, {ObjectId, Schema, model} from "mongoose";

export interface IReport {
    _id: ObjectId,
    from: {
        userId: {
            type: Number,
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: false,
        },
    },
    report: {
        type: String,
        required: true,
    }
};

const ReportSchema = new Schema({
    from: {
        userId: {
            type: Number,
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: false,
        },
    },
    report: {
        type: String,
        required: true,
    }
});

const Report = mongoose.model<IReport>('Report', ReportSchema);

export default Report;