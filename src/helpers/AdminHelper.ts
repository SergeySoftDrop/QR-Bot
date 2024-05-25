import State from "../TypesAndInterfaces/Session.js";
import Ban, { IBan } from "../models/Ban.js";
import mongoose from 'mongoose';

class AdminHelper {
    static isAdmin(ctx: State): boolean {
        return ctx.state.isAdmin;
    }

    static async setBan(ctx: State, userId: number, reason: string) {
        const currBan = await Ban.findOne({ userId }) as IBan;
        
        if (currBan) {
            await Ban.findByIdAndUpdate(currBan._id, { reason });
            await ctx.api.reply('Причина бана была обновлена.');
        } else {
            const res = await Ban.create({ userId, reason }) as IBan;
            await ctx.api.reply(`Пользователь с ID: ${res.userId} был забанен по причине: \n${res.reason}\n\nбан-ID: ${res._id.toString()}`);
        }
    }

    static async delBan(ctx: State, _id: string) {
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            await ctx.api.reply(`${_id} не является валидным бан-ID`);
            return;
        }

        const res = await Ban.findByIdAndDelete(new mongoose.Types.ObjectId(_id)) as IBan;
        if (res) {
            await ctx.api.reply(`Бан с ID: ${res._id.toString()} для пользователя с ID: ${res.userId} был удален.`);
        } else {
            await ctx.api.reply(`Запись с ID: ${_id} не найдена.`);
        }
    }
}

export default AdminHelper;
