import { asChildPropDef } from "@radix-ui/themes/props";
import NavBar from "@/app/NavBar";
import NameBar from "@/components/welcome";
import LittleNav from "@/components/dash_nav";
import Stats from "@/components/stats";
import Recent from "@/components/games";
import Leaderboard from "@/components/leaderboard";
export default function ProfilePage() {
  console.log("hello world is this not peakl???");

  return (
    <div className="size-full min-h-screen bg-gray-100">
      <div>
        <NavBar></NavBar>
      </div>

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
