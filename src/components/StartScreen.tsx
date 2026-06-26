/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { sound } from "../utils/sound";
import { Play, Settings, BookOpen, Volume2, VolumeX, ShieldQuestion } from "lucide-react";

interface StartScreenProps {
  onStartGame: () => void;
  onOpenOptions: () => void;
}

export default function StartScreen({ onStartGame, onOpenOptions }: StartScreenProps) {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [muted, setMuted] = useState(false);

  const handleStart = () => {
    sound.playClick();
    onStartGame();
  };

  const handleOptions = () => {
    sound.playClick();
    onOpenOptions();
  };

  const toggleMute = () => {
    sound.playClick();
    if (muted) {
      sound.setVolumes(50, 50);
      setMuted(false);
    } else {
      sound.setVolumes(0, 0);
      setMuted(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100 } 
    }
  };

  return (
    <div id="start-screen-container" className="relative z-10 w-full max-w-xl mx-auto px-4 text-center font-sans">
      
      {/* Interactive Sound Indicator */}
      <div className="absolute -top-12 right-4 z-20">
        <button
          onClick={toggleMute}
          className="p-2.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-all shadow-lg backdrop-blur-sm cursor-pointer"
          title={muted ? "เปิดเสียง" : "ปิดเสียง"}
        >
          {muted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-green-500" />}
        </button>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center space-y-8"
      >
        {/* Game Logo with Hover Glow & Floating Animation */}
        <motion.div 
          variants={itemVariants}
          className="relative group"
        >
          {/* Ambient Red glow circle behind logo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition duration-1000 animate-pulse"></div>
          
          <img
            src="https://res.cloudinary.com/dytnbmjnc/image/upload/v1782440016/logo_ibrufq.png"
            alt="Dan Sai Adventure Logo"
            referrerPolicy="no-referrer"
            className="relative w-48 h-48 md:w-56 md:h-56 object-contain animate-float drop-shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300"
          />
        </motion.div>

        {/* Game Title with Google Font Kanit styling */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white font-kanit drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
              Dan Sai Adventure
            </span>
          </h1>
          <p className="text-zinc-400 font-kanit text-sm md:text-base font-light tracking-widest uppercase">
            ด่านซ้าย แอดเวนเจอร์
          </p>
        </motion.div>

        {/* Cultural Subtitle */}
        <motion.p 
          variants={itemVariants}
          className="text-xs md:text-sm text-zinc-500 font-kanit max-w-sm leading-relaxed"
        >
          ผจญภัยสืบสานประเพณีผีตาโขนอันยิ่งใหญ่แห่งจังหวัดเลย ท้าทายอุปสรรคเพื่อเดินทางสู่วัดเนรมิตวิปัสสนา
        </motion.p>

        {/* Play & Options Button Menu */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-xs space-y-3.5 pt-4"
        >
          {/* เข้าเกม Button */}
          <button
            onClick={handleStart}
            onMouseEnter={() => sound.playSelect()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl text-lg font-bold font-kanit shadow-xl shadow-red-600/25 hover:shadow-red-500/35 border border-red-500/20 hover:border-red-400/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            เข้าเกม (Start Game)
          </button>

          {/* Options Button */}
          <button
            onClick={handleOptions}
            onMouseEnter={() => sound.playSelect()}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-2xl text-sm font-semibold font-kanit shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Settings className="w-4.5 h-4.5 text-zinc-400" />
            ปรับปรุงการบังคับ & เสียง (Options)
          </button>

          {/* How to Play Button */}
          <button
            onClick={() => { sound.playClick(); setShowHowToPlay(true); }}
            onMouseEnter={() => sound.playSelect()}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-transparent hover:bg-zinc-950 border border-transparent hover:border-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-2xl text-xs font-medium font-kanit transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            วิธีเล่น & เกร็ดวัฒนธรรม (How to Play)
          </button>
        </motion.div>

        {/* Copyright or Creator text */}
        <motion.div 
          variants={itemVariants}
          className="text-[10px] text-zinc-600 font-mono tracking-widest pt-8 border-t border-zinc-900 w-24"
        >
          V1.0.0
        </motion.div>
      </motion.div>

      {/* How to play modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-950 border border-red-500/30 rounded-2xl p-6 md:p-8 max-w-md w-full text-left space-y-5"
          >
            <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-900">
              <ShieldQuestion className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-bold font-kanit text-white">วิธีเล่น & สาระวัฒนธรรม</h3>
            </div>

            <div className="space-y-4 text-sm text-zinc-300 font-kanit leading-relaxed">
              <div className="space-y-1">
                <span className="font-semibold text-red-400 block">🎮 วิธีควบคุมตัวละคร:</span>
                <p>เคลื่อนที่ซ้าย-ขวา และกระโดดหลบหลีกอุปสรรคเพื่อเดินทางผ่านเส้นทางป่าเขาเมืองด่านซ้ายไปยัง <span className="text-yellow-400 font-medium">วัดเนรมิตวิปัสสนา</span> (ประตูปลายทาง)</p>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-yellow-400 block">✨ ของสะสมทางวัฒนธรรม:</span>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-zinc-400 pl-1">
                  <li><strong className="text-red-400">หน้ากากผีตาโขน:</strong> สัญลักษณ์สืบสานประเพณี (250 แต้ม)</li>
                  <li><strong className="text-yellow-400">กระดิ่งทอง (หมากกะแหล่ง):</strong> สร้างความสนุกสนาน (100 แต้ม)</li>
                  <li><strong className="text-green-400">กระติบข้าวเหนียว:</strong> พลังและอาหารของชุมชน (150 แต้ม)</li>
                </ul>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-emerald-400 block">🌾 อำเภอด่านซ้าย จังหวัดเลย:</span>
                <p className="text-xs text-zinc-400">ประเพณีละเล่นผีตาโขนจัดขึ้นในเทศกาลงานบุญหลวง (บุญพระเวส) ของผู้คนชาวด่านซ้าย เพื่อต้อนรับพระเวสสันดรและสร้างความรื่นเริงและอุดมสมบูรณ์แก่ชุมชน</p>
              </div>
            </div>

            <button
              onClick={() => { sound.playClick(); setShowHowToPlay(false); }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold font-kanit transition-all cursor-pointer text-center block"
            >
              รับทราบ นำฉันกลับเมนู
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
