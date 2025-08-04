export type DeathmatchState = {
  activePlayerIndex: number;
};

export type DeathmatchActions = {
  type: "advanceTurn";
  nextPlayerIndex: number;
  nextQuestionIndex: number;
  newTurnStartTime: number;
};
