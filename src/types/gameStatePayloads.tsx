import { GameMode, Lobby, Player, Question } from "./types";

type SetLobbyPayload = {
  lobby: Lobby;
};

type StartGamePayload = {
  initialPlayers: Player[];
  gameMode: GameMode;
  questions: Question[];
};

type RestartGamePayload = Record<string, never>;

type SetQuestionsPayload = {
  questions: Question[];
};

type HealthUpdatePayload = {
  playerId: string;
  health: number;
};

type StateUpdatePayload = {
  playerId: string;
  state: Player["state"];
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

type SubmitAnswerDeathmatchPayload = {
  answeringPlayerId: string;
  currentQuestionIndex: number;
  currentPlayerIndex: number;
  optionIndex: number;
};

type PlayerAnsweredPayload = {
  playerId: string;
  questionIndex: number;
  isCorrect: boolean;
};

type BossDamagePayload = {
  bossHealth: number;
};

type GameOverPayload = Record<string, never>;

type TeamDamagePayload = {
  playerHealths: { [playerId: string]: number };
};

export type BroadcastingPayloads = {
  setLobby: SetLobbyPayload;
  setStartGame: StartGamePayload;
  restartGame: RestartGamePayload;
  setQuestions: SetQuestionsPayload;
  setHealth: HealthUpdatePayload;
  setPlayerState: StateUpdatePayload;
  advanceTurnDeathmatch: TurnAdvanceDeathmatchPayload;
  advanceTurnBossfight: TurnAdvanceBossfightPayload;
  submitAnswerDeathmatch: SubmitAnswerDeathmatchPayload;
  recordPlayerAnswer: PlayerAnsweredPayload;
  setBossHealth: BossDamagePayload;
  setGameOver: GameOverPayload;
  teamDamage: TeamDamagePayload;
};

export type GameStateActionPayloads = {
  joinLobby: { lobby: Lobby; player: Player };
  exitLobby: Record<string, never>;
  setLobby: SetLobbyPayload;
  setHost: { player: Player };
  setGameMode: { gameMode: GameMode };
  setGameSubject: { subject: string };
  setName: { name: string };
  setPlayers: { players: Player[] };
  setCurrentPlayer: { player: Player };
  setQuestions: SetQuestionsPayload;
  setScore: { playerId: string; score: number };
  setHealth: HealthUpdatePayload;
  setPlayerState: StateUpdatePayload;
  setStartGame: StartGamePayload;
  advanceTurnDeathmatch: TurnAdvanceDeathmatchPayload;
  advanceTurnBossfight: TurnAdvanceBossfightPayload;
  submitAnswerDeathmatch: SubmitAnswerDeathmatchPayload;
  setBossHealth: BossDamagePayload;
  recordPlayerAnswer: PlayerAnsweredPayload;
  setGameOver: GameOverPayload;
  teamDamage: TeamDamagePayload;
  resetPlayerAnswers: Record<string, never>;
  restartGame: RestartGamePayload;
};

export const BROADCASTING_ACTION_KEYS = [
  "setLobby",
  "setStartGame",
  "restartGame",
  "setQuestions",
  "setHealth",
  "setPlayerState",
  "advanceTurnDeathmatch",
  "advanceTurnBossfight",
  "submitAnswerDeathmatch",
  "recordPlayerAnswer",
  "setBossHealth",
  "setGameOver",
  "teamDamage",
] as const satisfies readonly (keyof BroadcastingPayloads)[];

export type RecordValues<T extends Record<string | number | symbol, unknown>> =
  T[keyof T];

export type BroadcastingActions = (typeof BROADCASTING_ACTION_KEYS)[number];

const SomeEnum = {
  A: "A",
  B: "B",
} as const;
type SomeEnum = RecordValues<typeof SomeEnum>;

function a(e: SomeEnum): string {
  return e + "asd";
}
a(SomeEnum.A);
