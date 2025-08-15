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
  setLobby: SetLobbyPayload;
  setStartGame: StartGamePayload;
  restartGame: RestartGamePayload;
  setQuestions: SetQuestionsPayload;
  setHealth: HealthUpdatePayload;
  advanceTurnDeathmatch: TurnAdvanceDeathmatchPayload;
  advanceTurnBossfight: TurnAdvanceBossfightPayload;
  recordPlayerAnswer: PlayerAnsweredPayload;
  setBossHealth: BossDamagePayload;
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
