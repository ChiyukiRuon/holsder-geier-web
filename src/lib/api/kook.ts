import {apiClient, get} from "@/lib/axios";
import {KookUserInfo} from "@/types";

export async function getKookUserInfo(code: string): Promise<{ avatar: string, nickname: string }> {
    try {
        const response = await get<KookUserInfo>(
            apiClient,
            "/kook/user",
            {
                params: {
                    code: code,
                    redirectUrl: "https://hdg.chiyukiruon.top/koauth",
                },
            }
        );

        console.log("kook resp", response);

        return {
            avatar: response.avatar,
            nickname: response.username,
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}
