import mongoose, { Schema } from "mongoose";
;
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
const Ban = mongoose.model('Ban', BanSchema);
export default Ban;
//# sourceMappingURL=Ban.js.map