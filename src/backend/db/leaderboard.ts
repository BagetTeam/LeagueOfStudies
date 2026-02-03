import { supabase } from "../utils/database";

export async function addWin(email: string, type: string) {
  const { data: currentData, error: fetchError } = await supabase
    .from("stats")
    .select("b_wins, d_wins")
    .eq("email", email)
    .single();
  if (fetchError) {
    if (fetchError.code !== "PGRST116") {
      throw fetchError;
    }
    return;
  }
  const currBWins = currentData?.b_wins ?? 0;
  const currDWins = currentData?.d_wins ?? 0;
  if (type == "d") {
    const { error: updateError } = await supabase
      .from("stats")
      .update({ d_wins: currDWins + 1 })
      .eq("email", email);
    if (updateError) {
      throw updateError;
    }
  } else if (type == "b") {
    const { error: updateError } = await supabase
      .from("stats")
      .update({ b_wins: currBWins + 1 })
      .eq("email", email);
    if (updateError) {
      throw updateError;
    }
  }
}
export async function updateLeaderboard(
  email: string,
  xp: number,
  type: string,
) {
  try {
    const { data: currentStats, error: fetchError } = await supabase
      .from("stats")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError) {
      if (fetchError.code !== "PGRST116") {
        throw fetchError;
      }
      return;
    }

    const currentXp = currentStats?.totalXp ?? 0;
    const curr_d_total = currentStats?.d_total ?? 0;
    const curr_b_total = currentStats?.b_total ?? 0;
    const newXp = Math.max(0, currentXp + xp);

    const { error: updateError } = await supabase
      .from("stats")
      .update({ totalXp: newXp })
      .eq("email", email);
    if (type == "b") {
      const { error: totalError } = await supabase
        .from("stats")
        .update({ b_total: curr_b_total + 1 })
        .eq("email", email);
      if (totalError) {
        throw totalError;
      }
    } else if (type == "d") {
      const { error: totalError } = await supabase
        .from("stats")
        .update({ d_total: curr_d_total + 1 })
        .eq("email", email);
      if (totalError) {
        throw totalError;
      }
    }
    if (updateError) {
      throw updateError;
    }
  } catch {
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
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}
