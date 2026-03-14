import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui";
import { Terminal, Trophy, Zap, Code2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative flex-1 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="Hero background" 
          className="w-full h-full object-cover opacity-40 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background to-background" />
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary mb-6">
              <Zap className="w-4 h-4 fill-primary" />
              <span>The ultimate competitive programming arena</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-balance">
              Master Algorithms.<br />
              <span className="text-gradient">Dominate the Leaderboard.</span>
            </h1>
          </motion.div>

          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Level up your coding skills, solve challenging problems in Python and JavaScript, and compete with developers worldwide to climb the ranks.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/register">
              <Button size="lg" variant="glow" className="w-full sm:w-auto gap-2 text-lg px-8">
                Start Coding Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/problems">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 bg-background/50 backdrop-blur-md">
                View Problems
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8 mt-32 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          {[
            {
              icon: Code2,
              title: "Extensive Problem Library",
              desc: "Hundreds of algorithmic challenges ranging from Easy to Hard to test your logic."
            },
            {
              icon: Terminal,
              title: "In-Browser Execution",
              desc: "Write, run, and submit code instantly using our powerful integrated Monaco editor."
            },
            {
              icon: Trophy,
              title: "Global Leaderboards",
              desc: "Earn XP for every successful submission and climb your way to the top of the ranks."
            }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-2">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
