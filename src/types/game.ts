import type { CardType, GameStage } from './enums';
import type { PlayerGameState } from './base';

// 卡牌信息
export interface ScoreCard {
    value: number;
    type: CardType;
    index: number;
}

// 游戏状态
export interface GameState {
    phase: GameStage;
    currentRound: number;
    currentScoreCard: ScoreCard;
    carriedOverCards: ScoreCard[];
    playedCards: Array<{ playerId: string; card: number }>;
    lastPlayedCards?: Array<{ playerId: string; card: number }>;
    playerHands: Array<{
        playerId: string;
        handCount: number;
        scoreCardCount: number;
        score: number;
    }>;
}