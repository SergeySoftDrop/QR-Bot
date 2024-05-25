import Ban from "../models/Ban.js";
class BanHelper {
    static async chekBan(ctx) {
        const ban = await Ban.findOne({ userId: ctx.data?.from?.id });
        return ban ? ban : null;
    }
}
export default BanHelper;
//# sourceMappingURL=BanHelper.js.map