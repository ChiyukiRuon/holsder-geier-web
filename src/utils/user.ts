export const generateUserId = (): string => {
    if (crypto.randomUUID()) return crypto.randomUUID();
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const generateNickname = (): string => {
    return `玩家${(Math.random()*10000).toFixed(0).toString()}`;
};

export const generateUserColor = (): string => {
    const h = Math.floor(Math.random() * 360); // 色相
    const s = 70 + Math.random() * 30;         // 饱和度 70~100
    const l = 45 + Math.random() * 15;         // 亮度 45~60

    const S = s / 100;
    const L = l / 100;

    const c = (1 - Math.abs(2 * L - 1)) * S;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = L - c / 2;

    let r = 0, g = 0, b = 0;

    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    const toHex = (v: number) =>
        Math.round((v + m) * 255)
            .toString(16)
            .padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
export const getGoogleProfile = async (token: string): Promise<{
    name: string;
    avatar: string;
}> => {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    return {
        name: data.name ?? "",
        avatar: data.picture ?? "",
    };
};

export const getKOOKProfile = async (token: string): Promise<{
    name: string;
    avatar: string;
}> => {
    const res = await fetch("https://api.kookapp.cn/user/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    return {
        name: data.username ?? "",
        avatar: data.avatar ?? "",
    };
};

