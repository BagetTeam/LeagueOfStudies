import NavBar from "@/app/NavBar";
import NameBar from "@/components/welcome";
import LittleNav from "@/components/dash_nav";
import Stats from "@/components/stats";
import Recent from "@/components/games";
import Leaderboard from "@/components/leaderboard";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  console.log("hello world is this not peakl???");

  return (
    <div className="size-full min-h-screen bg-gray-100">
      <div>
        <NameBar name="Nate Higgers" xp={0} level={100}></NameBar>
      </div>

      <div>
        <Stats></Stats>
      </div>
      <div className="flex flex-row justify-between px-8">
        <Recent></Recent>
        <Leaderboard></Leaderboard>
      </div>
    </div>
  );
}
// "use client";

// import { useEffect, useState } from "react";
// import { createClient } from "@supabase/supabase-js";
// import NavBar from "@/app/NavBar";
// import NameBar from "@/components/welcome";
// import LittleNav from "@/components/dash_nav";
// import Stats from "@/components/stats";
// import Recent from "@/components/games";
// import Leaderboard from "@/components/leaderboard";
// // Setup Supabase client
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// );

// export default function ProfilePage() {
//   const [name, setName] = useState<string>("");
//   const [xp, setXp] = useState<number>(0);
//   const [level, setLevel] = useState<number>(0);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         const { data: userData, error: userError } =
//           await supabase.auth.getUser();

//         if (userError || !userData.user) {
//           console.error("User fetch error:", userError);
//           return;
//         }

//         const userEmail = userData.user.email;

//         if (!userEmail) {
//           console.error("No user email found.");
//           return;
//         }

//         // Fetch user name from "users" table
//         const { data: userProfile, error: profileError } = await supabase
//           .from("users")
//           .select("name")
//           .eq("email", userEmail)
//           .single();

//         if (profileError) {
//           console.error("Profile fetch error:", profileError);
//           return;
//         }

//         setName(userProfile.name || "Unnamed User");

//         // Fetch stats from "stats" table
//         const { data: userStats, error: statsError } = await supabase
//           .from("stats")
//           .select("totalXp, level")
//           .eq("email", userEmail)
//           .single();

//         if (statsError) {
//           console.error("Stats fetch error:", statsError);
//           return;
//         }

//         setXp(userStats.totalXp || 0);
//         setLevel(userStats.level || 0);
//       } catch (err) {
//         console.error("Unexpected error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfileData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <div className="size-full min-h-screen bg-gray-100">
//       <div>
//         <NavBar />
//       </div>

//       <div>
//         <NameBar name={name} xp={xp} level={level} />
//       </div>

//       <div>
//         <Stats />
//       </div>

//       <div className="flex flex-row justify-between px-8">
//         <Recent />
//         <Leaderboard />
//       </div>
//     </div>
//   );
// }
