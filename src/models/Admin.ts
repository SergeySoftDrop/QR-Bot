import mongoose, {ObjectId, Schema, model} from "mongoose";

interface IAdmin {
    _id: ObjectId,
    userId: {
        type: Number,
        required: true,
    },
    notifySettings: {
        suspiciousActivity: {
            type: Boolean,
            default: false
        },
        newReports: {
            type: Boolean,
            default: false
        },
    }
};

const AdminSchema = new Schema({
    userId: {
        type: Number,
        required: true,
    },
    notifySettings: {
        suspiciousActivity: {
            type: Boolean,
            default: false
        },
        newReports: {
            type: Boolean,
            default: false
        },
    }
});

const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;