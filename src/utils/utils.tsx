import { BROADCAST_EVENTS } from "@/GameContext";
import { BroadcastingPayloads } from "@/types/gameStatePayloads";

export function createBroadcastPayload<
  T extends (typeof BROADCAST_EVENTS)[keyof typeof BROADCAST_EVENTS],
>(event: T, payload: BroadcastingPayloads[T]) {
  return {
    event,
    payload,
  };
}
