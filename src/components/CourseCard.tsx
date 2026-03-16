"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Calculator, FunctionSquare, Infinity as InfinityIcon, Sigma, ChevronRight } from "lucide-react";
import { Button } from "./ui/Button";

interface CourseCardProps {
  id?: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  iconName?: string;
  price?: number;
  onEnroll?: (e: React.MouseEvent) => void;
  isEnrolled?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-8 h-8 text-primary" />,
  Calculator: <Calculator className="w-8 h-8 text-secondary" />,
  FunctionSquare: <FunctionSquare className="w-8 h-8 text-accent" />,
  Infinity: <InfinityIcon className="w-8 h-8 text-primary" />,
  Sigma: <Sigma className="w-8 h-8 text-secondary" />,
  CalculatorIcon: <Calculator className="w-8 h-8 text-secondary" />,
  FunctionSquareIcon: <FunctionSquare className="w-8 h-8 text-accent" />,
};

const levelColorMap = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
};

export default function CourseCard({ 
  id,
  title, 
  description, 
  level, 
  duration, 
  iconName = "BookOpen", 
  price = 0,
  onEnroll,
  isEnrolled
}: CourseCardProps) {
  const cardContent = (
    <>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
      
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
          {iconMap[iconName] || <BookOpen className="w-8 h-8 text-primary" />}
        </div>
        <div className="flex flex-col items-end gap-2">
           <span className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColorMap[level]}`}>
             {level}
           </span>
           {price > 0 && (
             <span className="text-sm font-bold text-primary">₹{price}</span>
           )}
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-slate-600 mb-6 flex-grow text-sm line-clamp-3">{description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-medium text-slate-500">{duration}</span>
        <div className="flex gap-2">
           <Button 
            variant={price === 0 ? "outline" : "default"} 
            size="sm" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEnroll?.(e);
            }}
            className="rounded-xl transition-all duration-300 shadow-sm"
          >
            {isEnrolled ? "Start Learning" : (price === 0 ? "Enroll Free" : "Buy Now")}
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <motion.div
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
    >
      {id ? (
        <Link 
          href={`/courses/${id}`}
          className="glass p-6 rounded-3xl flex flex-col h-full relative overflow-hidden group border border-white/20 shadow-xl hover:shadow-2xl transition-all block"
        >
          {cardContent}
        </Link>
      ) : (
        <div className="glass p-6 rounded-3xl flex flex-col h-full relative overflow-hidden group border border-white/20 shadow-xl">
          {cardContent}
        </div>
      )}
    </motion.div>
  );
}
