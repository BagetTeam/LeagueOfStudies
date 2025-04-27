"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Profile() {
  const [openEdit, setOpenEdit] = useState(false);
  const router = useRouter();
  const name = "Nigga Joe";
  const email = "joenigga@email.com";

  const level = 20;
  const progress = 40;
  const totalXp = 1000;
  const xp = Math.floor(totalXp * (progress / 100));
  const wins = 12;
  const games = 14;

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
    <div className="mb-2 flex w-full flex-col overflow-x-hidden">
      <div className="bg-primary/10 min-h-[100vh]">
        <div>
          <div className="flex flex-col p-4">
            <div className="w-50">Preview</div>
            <div className="flex">
              <div className="flex w-fit flex-col items-center rounded-xl bg-white p-6">
                <img
                  src="/BigBrain.png"
                  alt="BigBrain"
                  width={150}
                  height={140}
                ></img>
                <div className="flex flex-row items-center">
                  <div className="mr-2 text-center text-2xl font-bold">
                    {name}
                  </div>
                  <button
                    className="h-5 rounded-md bg-gray-200 px-1 font-mono text-xs hover:cursor-pointer"
                    onClick={() => {
                      setOpenEdit(!openEdit);
                    }}
                  >
                    ✎
                  </button>
                </div>
                <div className="flex flex-row items-center">
                  <div className="p-2 text-center text-[15px] text-gray-400">
                    {email}
                  </div>
                  <button
                    className="h-5 rounded-md bg-gray-200 px-1 font-mono text-xs hover:cursor-pointer"
                    onClick={() => {
                        setOpenEdit(!openEdit);
                    }}
                  >
                    ✎
                  </button>
                </div>
                <div className="rounded-lg bg-gray-200 px-3.5 text-center font-medium">
                  Level {level}
                </div>
                <div className="flex w-full flex-row justify-between gap-55 p-2">
                  <div className="text-left">{"XP Progress"}</div>
                  <div className="text-right">
                    {xp}/{totalXp}
                  </div>
                </div>
                <div className="w-full px-2 pb-4">
                  <div className="items-left h-2 w-full rounded-xs bg-gray-600/15">
                    <div
                      className={`h-full rounded-xs bg-red-600`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <button
                  className="rounded-lg bg-gray-200 px-3.5 font-mono hover:cursor-pointer"
                  onClick={() => {
                    router.push("/profile/edit");
                  }}
                >
                  Edit Profile
                </button>
                <div className="pb-3"></div>
                <div className="h-[0.5px] w-full bg-gray-600/15"></div>
                <div className="items-left flex w-full flex-col">
                  <div className="text-center">Start</div>
                  <div className="flex w-full flex-row justify-between gap-4">
                    <div>Games Won</div>
                    <div className="text-right">{wins}</div>
                  </div>
                  <div className="flex w-full flex-row justify-between gap-4">
                    <div>Games Played</div>
                    <div className="text-right">{games}</div>
                  </div>
                  <div className="flex w-full flex-row justify-between gap-4">
                    <div>blank</div>
                    <div className="text-right">{games}</div>
                  </div>
                  <div className="flex w-full flex-row justify-between gap-4">
                    <div>blank</div>
                    <div className="text-right">{games}</div>
                  </div>
                </div>
              </div>
              {openEdit && (
                <div>
                  <div className="ml-2 w-full max-w-sm min-w-[200px]">
                    <input
                      className="ease w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:shadow focus:outline-none"
                      placeholder="Type here..."
                    ></input>
                  </div>
                  <button
                    className="h-5 rounded-md m-2 bg-gray-200 px-1 font-mono text-xs hover:cursor-pointer outline-1"
                    onClick={() => {
                      router.push("/profile/edit");
                    }}>
                    Save as Name
                  </button>
                  <button
                    className="h-5 rounded-md p-0.5 m-2 bg-gray-200 px-1 font-mono text-xs hover:cursor-pointer outline-1"
                    onClick={() => {
                      router.push("/profile/edit");
                    }}>
                    Save as Email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
