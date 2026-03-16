"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import { Trophy, Medal, Crown, Star, ArrowUp, User } from "lucide-react";

export default function LeaderboardPage() {
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (res.ok) setTopStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="bg-slate-50">
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-yellow-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200"
          >
            <Trophy className="w-10 h-10 text-yellow-600" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Global Leaderboard</h1>
          <p className="text-slate-600 text-lg">Top performing students mastering mathematics every day.</p>
        </div>

        {/* Podium for top 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
          {/* 2nd Place */}
          {topStudents[1] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col items-center order-2 md:order-1"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 relative">
                <User className="w-8 h-8 text-slate-400" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center border-4 border-white">
                  <span className="text-xs font-bold text-slate-600">2</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{topStudents[1].name}</h3>
              <p className="text-primary font-bold text-lg">{topStudents[1].points} pts</p>
              <div className="mt-4 px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master</div>
            </motion.div>
          )}

          {/* 1st Place */}
          {topStudents[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary p-10 rounded-[3rem] shadow-2xl shadow-primary/30 text-center flex flex-col items-center relative z-10 order-1 md:order-2 scale-110"
            >
              <Crown className="w-8 h-8 text-yellow-400 absolute -top-5 rotate-12" />
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 relative">
                <User className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-primary">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
              <h3 className="font-bold text-white text-xl mb-1">{topStudents[0].name}</h3>
              <p className="text-yellow-200 font-extrabold text-2xl">{topStudents[0].points} pts</p>
              <div className="mt-4 px-4 py-1.5 bg-white/10 rounded-full text-xs font-bold text-white uppercase tracking-widest">Grandmaster</div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {topStudents[2] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col items-center order-3"
            >
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 relative">
                <User className="w-8 h-8 text-orange-200" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center border-4 border-white">
                  <span className="text-xs font-bold text-orange-600">3</span>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{topStudents[2].name}</h3>
              <p className="text-primary font-bold text-lg">{topStudents[2].points} pts</p>
              <div className="mt-4 px-3 py-1 bg-orange-50 rounded-full text-[10px] font-bold text-orange-400 uppercase tracking-widest">Expert</div>
            </motion.div>
          )}
        </div>

        {/* List for the rest */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          {topStudents.slice(3).map((student, idx) => (
            <motion.div 
              key={student._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="flex items-center justify-between p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-6">
                <span className="w-8 text-center font-bold text-slate-400 text-lg">#{idx + 4}</span>
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{student.name}</h4>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter italic">Rising Star</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="text-right">
                    <p className="font-bold text-slate-900">{student.points}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Points</p>
                 </div>
                 <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <ArrowUp className="w-4 h-4 text-green-500" />
                 </div>
              </div>
            </motion.div>
          ))}
          {topStudents.length === 0 && (
            <div className="p-12 text-center text-slate-500 italic">No students ranked yet. Start learning to see your name here!</div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
