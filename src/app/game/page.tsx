import { GameMode } from "@/types/types";

// Define initial/default game mode if needed
const defaultGameMode: GameMode = {
  type: "deathmatch", // Or your most common mode
  data: { activePlayerIndex: 0, time: 15 }, // Corresponds to TURN_DURATION_SECONDS
};
