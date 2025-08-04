import { supabase } from "../utils/database";

export async function updateLeaderboard(email: string, xp: number) {
  try {
    const { data: currentStats, error: fetchError } = await supabase
      .from("stats")
      .select("totalXp")
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
    const newXp = Math.max(0, currentXp + xp);

    console.log(`Updating XP for ${email}: ${currentXp} -> ${newXp}`);

    const { error: updateError } = await supabase
      .from("stats")
      .update({ totalXp: newXp })
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
