import { GameMode, Lobby, Player, Question } from "./types";

type SetLobbyPayload = {
  lobby: Lobby;
};

type StartGamePayload = {
  initiatedBy: number;
  initialPlayers: Player[];
  gameMode: GameMode;
  questions: Question[];
};

type RestartGamePayload = {};

type SetQuestionsPayload = {
  questions: Question[];
};

type HealthUpdatePayload = {
  playerId: string;
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
  playerId: string;
  questionIndex: number;
  isCorrect: boolean;
};

type BossDamagePayload = {
  bossHealth: number;
};

export type BroadcastingPayloads = {
  SET_LOBBY_CONFIG: SetLobbyPayload;
  START_GAME: StartGamePayload;
  RESTART_GAME: RestartGamePayload;
  SET_QUESTIONS: SetQuestionsPayload;
  HEALTH_UPDATE: HealthUpdatePayload;
  TURN_ADVANCE_DEATHMATCH: TurnAdvanceDeathmatchPayload;
  TURN_ADVANCE_BOSSFIGHT: TurnAdvanceBossfightPayload;
  PLAYER_ANSWERED: PlayerAnsweredPayload;
  BOSS_DAMAGED: BossDamagePayload;
};

export type GameStateActionPayloads = {
  joinLobby: { lobby: Lobby; player: Player };
  exitLobby: {};
  setLobby: SetLobbyPayload;
  setHost: { player: Player };
  setGameMode: { gameMode: GameMode };
  setGameSubject: { subject: string };
  setName: { name: string };
  setPlayers: { players: Player[] };
  setCurrentPlayer: { player: Player };
  setPlayerState: { playerId: string; state: Player["state"] };
  setQuestions: SetQuestionsPayload;
  setScore: { playerId: string; score: number };
  setHealth: HealthUpdatePayload;
  setStartGame: StartGamePayload;
  advanceTurnDeathmatch: TurnAdvanceDeathmatchPayload;
  advanceTurnBossfight: TurnAdvanceBossfightPayload;
  setBossHealth: BossDamagePayload;
  recordPlayerAnswer: PlayerAnsweredPayload;
  resetPlayerAnswers: {};
  restartGame: RestartGamePayload;
};
