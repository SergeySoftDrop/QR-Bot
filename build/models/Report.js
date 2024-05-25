import mongoose, { Schema } from "mongoose";
;
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
const Report = mongoose.model('Report', ReportSchema);
export default Report;
//# sourceMappingURL=Report.js.map