import { supabase } from "../utils/database";

export async function addWin(email: string) {
  const { data: currentData, error: fetchError } = await supabase
    .from("stats")
    .select("wins")
    .eq("email", email)
    .single();
  if (fetchError) {
    if (fetchError.code === "PGRST116") {
      // Supabase code for 'Not Found'
      console.warn(
        `No stats row found for ${email}. Cannot update wins directly.`,
      );
    } else {
      console.error(`Error fetching user wins for ${email}:`, fetchError);
      throw fetchError;
    }
    return;
  }
  const currentWins = currentData?.wins ?? 0;
  const { error: updateError } = await supabase
    .from("stats")
    .update({ wins: currentWins + 1 })
    .eq("email", email);
  if (updateError) {
    console.error(`Error updating user XP for ${email}:`, updateError);
    throw updateError;
  }
}
export async function updateLeaderboard(email: string, xp: number) {
  try {
    const { data: currentStats, error: fetchError } = await supabase
      .from("stats")
      .select("totalXp, totalGames")
      .eq("email", email)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // Supabase code for 'Not Found'
        console.warn(
          `No stats row found for ${email}. Cannot update XP directly.`,
        );
      } else {
        console.error(`Error fetching user stats for ${email}:`, fetchError);
        throw fetchError;
      }
      return;
    }

    // Make sure playing xp doesn't go negative
    const currentXp = currentStats?.totalXp ?? 0;
    const currentGameNumber = currentStats?.totalGames ?? 0;
    const newXp = Math.max(0, currentXp + xp);

    console.log(`Updating XP for ${email}: ${currentXp} -> ${newXp}`);

    const { error: updateError } = await supabase
      .from("stats")
      .update({ totalXp: newXp, totalGames: currentGameNumber + 1 })
      .eq("email", email);

    if (updateError) {
      console.error(`Error updating user XP for ${email}:`, updateError);
      throw updateError;
    }

    console.log(`Successfully updated XP for ${email} to ${newXp}`);
  } catch (error) {
    console.error("Failed to update user XP:", error);
  }
}

export async function fetchLeaderboard() {
  try {
    const { data, error } = await supabase
      .from("stats")
      .select("email, totalXp")
      .gt("totalXp", 0)
      .order("totalXp", { ascending: false });

    if (error) {
      console.error("Error fetching leaderboard:", error);
    } else {
      return data || [];
    }
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
  }
}
