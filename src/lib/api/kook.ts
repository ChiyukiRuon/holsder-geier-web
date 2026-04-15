import {apiClient} from "@/lib/axios";
import {KookUserInfo} from "@/types";

export async function getKookUserInfo(code: string): Promise<{ avatar: string, nickname: string }> {
    try {
        const response = await apiClient.get<KookUserInfo>(`/auth/kook/userinfo?code=${code}&redirectUrl=https://hdg.chiyukiruon.top/koauth`);

        return {
            avatar: response.avatar,
            nickname: response.username,
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
