import { TabsContent } from "@/ui";

export default function AchievementsTab() {
  return (
    <TabsContent value="achievements">
      <div className="game-card">
        <h2 className="mb-2 text-xl font-semibold">Your Achievements</h2>
        <p className="text-muted-foreground mb-6">
          Track your progress and unlock achievements as you study
        </p>

        <div className="space-y-4">
          {/* {achievements.map((achievement) => ( */}
          {/*   <div */}
          {/*     key={achievement.id} */}
          {/*     className={`rounded-lg border p-4 ${achievement.completed ? "border-theme-orange/50 bg-theme-orange/5" : ""}`} */}
          {/*   > */}
          {/*     <div className="flex items-center gap-3"> */}
          {/*       <div */}
          {/*         className={`flex h-10 w-10 items-center justify-center rounded-full ${achievement.completed ? "bg-theme-orange/20" : "bg-muted"}`} */}
          {/*       > */}
          {/*         <achievement.icon */}
          {/*           className={`h-5 w-5 ${achievement.completed ? "text-theme-orange" : "text-muted-foreground"}`} */}
          {/*         /> */}
          {/*       </div> */}
          {/**/}
          {/*       <div className="flex-1"> */}
          {/*         <div className="flex items-center justify-between"> */}
          {/*           <h3 className="flex items-center gap-2 font-semibold"> */}
          {/*             {achievement.name} */}
          {/*             {achievement.completed && ( */}
          {/*               <Star className="text-theme-orange fill-theme-orange h-4 w-4" /> */}
          {/*             )} */}
          {/*           </h3> */}
          {/*           <span className="text-sm font-medium"> */}
          {/*             {achievement.progress}% */}
          {/*           </span> */}
          {/*         </div> */}
          {/*         <p className="text-muted-foreground text-sm"> */}
          {/*           {achievement.description} */}
          {/*         </p> */}
          {/**/}
          {/*         <div className="bg-muted mt-2 h-1.5 w-full rounded-full"> */}
          {/*           <div */}
          {/*             className={`h-1.5 rounded-full ${achievement.completed ? "bg-theme-orange" : "bg-theme-purple"}`} */}
          {/*             style={{ width: `${achievement.progress}%` }} */}
          {/*           ></div> */}
          {/*         </div> */}
          {/*       </div> */}
          {/*     </div> */}
          {/*   </div> */}
          {/* ))} */}
        </div>
      </div>
    </TabsContent>
  );
}
