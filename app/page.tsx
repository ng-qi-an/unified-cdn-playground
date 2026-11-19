'use client';
import LetterGlitch from "@/components/LetterGlitch";
import TechText from "@/components/TechText";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react"
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function Home(){
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();
  return <AnimatePresence>
    {!navigating && <motion.div animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.5}} className="flex flex-col items-center justify-center h-screen">
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <LetterGlitch
          glitchColors={["#ffffff","#1665f9"]}
          glitchAmount={0.3}
          speed={0.7}
          flow={0.5}
          clickEffect="tear"
          density={0.8}
          baseOpacity={0.2}
          centerFade={0.5}
        />
      </div>
      <div className="max-w-[600px] w-full" style={{height: '160px', position: 'relative' }}>
        <TechText
          text="Playground"
          fontWeight={500}
          fontSize={100}
          reveal="letter"
          dashLength={4}
          dashGap={2}
          specks={8}
          intro="metrics"
          introDuration={2.8}
          clickKick
          guides={false}
          fontFamily=""
          letterSpacing={-0.03}
          accentColor="currentColor"
          reach={200}
          softness={0.7}
          lineStyle="solid"
          strokeWidth={1.25}
          speed={0.5}
          bounce={0.75}
          selection
          labels
          color="currentColor"
          align="center"
          draggable
          sweep
        />
      </div>
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{delay: 2.3, duration: 0.8, type: "spring"}} className="flex gap-4">
        <Button size="lg" className="px-8 py-6 text-lg gap-4" variant="outline">Source code</Button>
        <Button size="lg" className="px-8 pr-6 py-6 text-lg gap-4" onClick={()=>{
          setNavigating(true);
          setTimeout(()=>{
            router.push("/photos");
          }, 500)
        }}>Start <ArrowRight/></Button>
      </motion.div>
    </motion.div>}
  </AnimatePresence>
}