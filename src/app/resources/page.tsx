"use client";

import { motion } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import { Download, FileText, PlayCircle, Code, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

const resources = [
  {
    title: "Algebra I Formula Sheet",
    type: "PDF",
    description: "A comprehensive cheat sheet with all essential formulas for Algebra I.",
    icon: <FileText className="w-8 h-8 text-secondary" />,
    isLocked: false
  },
  {
    title: "Geometry Proofs Guide",
    type: "Interactive PDF",
    description: "Step-by-step examples of common Euclidean geometry proofs.",
    icon: <Code className="w-8 h-8 text-primary" />,
    isLocked: false
  },
  {
    title: "Calculus Limits Video Series",
    type: "Video",
    description: "Visualizing limits using dynamic 3D graphing software.",
    icon: <PlayCircle className="w-8 h-8 text-accent" />,
    isLocked: true
  },
  {
    title: "Olympiad Practice Test 1",
    type: "Worksheet",
    description: "Past competition problems with full step-by-step solutions.",
    icon: <FileText className="w-8 h-8 text-secondary" />,
    isLocked: true
  }
];

export default function ResourcesPage() {
  return (
    <PageWrapper className="bg-white">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Learning Resources
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Download free cheat sheets, review lecture summaries, and tackle practice problems curated by our experts.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {resources.map((res, idx) => (
            <motion.div
              key={res.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 md:p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl hover:border-slate-200 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {res.icon}
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-200 px-2 py-1 rounded-md">
                    {res.type}
                  </span>
                  {res.isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{res.title}</h3>
                <p className="text-sm text-slate-600 mb-4 sm:mb-0">{res.description}</p>
              </div>

              <div className="w-full sm:w-auto flex-shrink-0">
                <Button 
                  variant={res.isLocked ? "outline" : "default"} 
                  className={res.isLocked ? "w-full" : "w-full bg-secondary hover:bg-secondary/90 text-white"}
                >
                  {res.isLocked ? "Enroll to Unlock" : "Download"}
                  {!res.isLocked && <Download className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
