import State from "../TypesAndInterfaces/Session.js";
import Ban from "../models/Ban.js";

class BanHelper {
    static async chekBan(ctx: State) {
        const ban = await Ban.findOne({userId: ctx.data?.from?.id});
        return ban ? ban : null;
    }
}

export default BanHelper