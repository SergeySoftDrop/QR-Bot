import mongoose, { Schema } from "mongoose";
;
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
const Admin = mongoose.model('Admin', AdminSchema);
export default Admin;
//# sourceMappingURL=Admin.js.map