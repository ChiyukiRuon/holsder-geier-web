import {GameStage} from "@/types";

export const getGameStageName = (stage?: GameStage) => {
    if (!stage) return '未开始';

    switch (stage) {
        case 'idle':
            return '等待开始';
        case 'reveal':
            return '翻牌';
        case 'play':
            return '出牌';
        case 'resolve':
            return '回合结算';
        case 'end':
            return '游戏结束';
        default:
            return '未知';
    }
};
