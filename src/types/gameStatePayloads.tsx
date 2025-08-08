import { GameMode, Player, Question } from "./types";

type StartGamePayload = {
  initiatedBy: number;
  initialPlayers: Player[];
  gameMode: GameMode;
  questions: Question[];
};

type SetQuestionsPayload = {
  questions: Question[];
};

type HealthUpdatePayload = {
  playerId: number;
  health: number;
};

type TurnAdvanceDeathmatchPayload = {
  currentPlayerIndex: number;
  currentQuestionIndex: number;
  startTime: number;
};

type TurnAdvanceBossfightPayload = {
  currentQuestionIndex: number;
  startTime: number;
};

type PlayerAnsweredPayload = {
  playerId: number;
  questionIndex: number;
  isCorrect: boolean;
};

type BossDamagePayload = {
  bossHealth: number;
};

export type BroadcastingPayloads = {
  start_game: StartGamePayload;
  set_questions: SetQuestionsPayload;
  health_update: HealthUpdatePayload;
  turn_advance_deathmatch: TurnAdvanceDeathmatchPayload;
  turn_advance_bossfight: TurnAdvanceBossfightPayload;
  player_answered: PlayerAnsweredPayload;
  boss_damage: BossDamagePayload;
};
