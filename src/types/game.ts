// 卡牌信息
import {GameStage} from "@/types/enums";

export interface PointCard {
    value: number;
}

// 游戏状态
export interface GameState {
    stage: GameStage;
    currentRound: number;
    currentPointCards: PointCard[];
    carriedOverCards: PointCard[];
    playedCards: Array<{ playerId: string; card: number | null }>;
    lastPlayedCards?: Array<{ playerId: string; card: number | null }>;
}
