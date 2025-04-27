"use client"

import Image from "next/image";
import { PlayerCard } from "../components/PlayerCard";
import NavBar from "../NavBar";
import { number } from "motion";
import { Button } from "@/ui";

export default function Profile() {
    const name = "Nigga Joe";
    const email = "joenigga@email.com";

    const level = 20;
    const progress = 40;
    const totalXp = 1000;
    const xp = Math.floor(totalXp * (progress / 100));
    const wins = 12;
    const games = 14

    const math = 5;
    const gooning = 90;
    const history = 40;
    const computerscience = 1;

    const streak = 4;
    const monday: boolean = false;
    const tuesday: boolean = true;
    const wednesday: boolean = true;
    const thursday: boolean = true;
    const friday: boolean = false;
    const saturday: boolean = true;
    const sunday: boolean = true;
    return (
    <div className="flex flex-col mb-2 w-full overflow-x-hidden">
        <div className="bg-primary/10 min-h-[100vh]">

            <div className="flex p-4">
                <div className="items-center flex flex-col bg-white p-6 rounded-xl">
                    <img src="BigBrain.png" alt="BigBrain" width={150} height={140}></img>
                    <div className="text-center text-2xl font-bold">{name}</div>
                    <div className="text-center text-gray-400 text-[15px] p-2">{email}</div>
                    <div className="text-center rounded-lg bg-gray-200 font-medium px-3.5">Level {level}</div>
                    <div className="flex flex-row justify-between w-full p-2 gap-55">
                        <div className="text-left">{"XP Progress"}</div>
                        <div className="text-right">{xp}/{totalXp}</div>
                    </div>
                    <div className="w-full px-2 pb-4">
                        <div className="items-left bg-gray-600/15 h-2 w-full rounded-xs">
                            <div className={`bg-red-600 rounded-xs h-full `} style={{width: `${progress}%`}}></div>
                        </div>
                    </div>
                    <button className="bg-gray-200 px-3.5 hover:cursor-pointer font-mono rounded-lg" onClick={()=>{}}>Edit Profile</button>
                    <div className="pb-3"></div>
                    <div className="h-[0.5px] w-full bg-gray-600/15"></div>
                    <div className="items-left flex flex-col w-full">
                        <div className="text-center">Start</div>
                        <div className="flex flex-row justify-between w-full gap-4">
                            <div >Games Won</div>
                            <div className="text-right">{wins}</div>
                        </div>
                        <div className="flex flex-row justify-between w-full gap-4">
                            <div >Games Played</div>
                            <div className="text-right">{games}</div>
                        </div>
                        <div className="flex flex-row justify-between w-full gap-4">
                            <div >blank</div>
                            <div className="text-right">{games}</div>
                        </div>
                        <div className="flex flex-row justify-between w-full gap-4">
                            <div >blank</div>
                            <div className="text-right">{games}</div>
                        </div>
                    </div>

                </div>
                <div className="ml-5 mr-4 w-full">
                    <div className="items-left bg-white py-6 px-9 rounded-xl">
                        <div className="bg-gray-200 px-3.5 font-medium rounded-lg text-center py-0.5 text-[26px]">Progress</div>
                        <div className="font-medium pb-4 pt-2 text-[22px]">Subject Performance</div>
                        <div className="flex flex-row justify-between w-full gap-4">
                            <div >Meth</div>
                            <div className="text-right">{math}%</div>
                        </div>
                        <div className="w-full pb-3.5 pt-2.5">
                            <div className="items-left bg-gray-600/15 h-2 w-full rounded-xs">
                                <div className={`bg-blue-600 rounded-xs h-full `} style={{width: `${math}%`}}></div>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between w-full gap-4">
                            <div >Gooning</div>
                            <div className="text-right">{gooning}%</div>
                        </div>
                        <div className="w-full pb-3.5 pt-2.5">
                            <div className="items-left bg-gray-600/15 h-2 w-full rounded-xs">
                                <div className={`bg-pink-300 rounded-xs h-full `} style={{width: `${gooning}%`}}></div>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between w-full gap-4">
                            <div >History</div>
                            <div className="text-right">{history}%</div>
                        </div>
                        <div className="w-full pb-3.5 pt-2.5">
                            <div className="items-left bg-gray-600/15 h-2 w-full rounded-xs">
                                <div className={`bg-green-600 rounded-xs h-full `} style={{width: `${history}%`}}></div>
                            </div>
                        </div>
                        <div className="flex flex-row justify-between w-full gap-4">
                            <div >Computer Science</div>
                            <div className="text-right">{computerscience}%</div>
                        </div>
                        <div className="w-full pb-3.5 pt-2.5">
                            <div className="items-left bg-gray-600/15 h-2 w-full rounded-xs">
                                <div className={`bg-blue-300 rounded-xs h-full `} style={{width: `${computerscience}%`}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="items-left bg-white py-6 px-9 rounded-xl mt-6">
                        <div className="bg-gray-200 px-3.5 font-medium rounded-lg text-center py-0.5 text-[26px]">Weekly Activity</div>
                        <div className="text-lg pb-3 pt-4">Weekly Streak: <span className="font-medium">{streak}</span></div>
                        <div className="grid grid-cols-7 place-items-center gap-0.5">
                            <div>Monday</div>
                            <div>Tuesday</div>
                            <div>Wednesday</div>
                            <div>Thursday</div>
                            <div>Friday</div>
                            <div>Saturday</div>
                            <div>Sunday</div>
                        </div>                        
                        <div className="place-items-center grid grid-cols-7 gap-0.5">
                            {monday ? 
                                <div className="bg-green-500 rounded-md w-6">​</div>
                             :
                                <div className="bg-gray-300 rounded-md w-6">​</div>
                            }
                            {tuesday ? 
                                <div className="bg-green-500 rounded-md w-6">​</div>
                             :
                                <div className="bg-gray-300 rounded-md w-6">​</div>
                            }
                            {wednesday ? 
                                <div className="bg-green-500 rounded-md w-6">​</div>
                             :
                                <div className="bg-gray-300 rounded-md w-6">​</div>
                            }
                            {thursday ? 
                                <div className="bg-green-500 rounded-md w-6">​</div>
                             :
                                <div className="bg-gray-300 rounded-md w-6">​</div>
                            }
                            {friday ? 
                                <div className="bg-green-500 rounded-md w-6">​</div>
                             :
                                <div className="bg-gray-300 rounded-md w-6">​</div>
                            }
                            {saturday ? 
                                <div className="bg-green-500 rounded-md w-6">​</div>
                             :
                                <div className="bg-gray-300 rounded-md w-6">​</div>
                            }
                            {sunday ? 
                                <div className="bg-green-500 rounded-md w-6">​</div>
                             :
                                <div className="bg-gray-300 rounded-md w-6">​</div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}
