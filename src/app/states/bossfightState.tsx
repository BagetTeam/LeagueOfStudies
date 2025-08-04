export type BossFightState = {
  turnStartTime: number | null;
  bossHealth: number;
  isTeamVictory: boolean | null;
  playerAnswers: {
    [playerId: number]: {
      answered: boolean;
      isCorrect: boolean | null;
    };
  };
};

export type BossFightActions =
  | {
      type: "setBossFightGameOver";
      isVictory: boolean;
    }
  | {
      type: "setBossHealth";
      newBossHealth: number;
    }
  | {
      type: "recordPlayerAnswer";
      playerId: number;
      questionIndex: number; // Ensure it's for the current question
      isCorrect: boolean | null;
    };

export function bossfightStateReducer(
  state: BossFightState,
  action: BossFightActions,
): BossFightState {
  return state;
}
