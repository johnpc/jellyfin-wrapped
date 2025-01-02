import { ScrollingTextProps } from "@/types";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ScrollingText({
  generatedImage,
  story,
}: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedStory, setDisplayedStory] = useState("");

  useEffect(() => {
    if (currentIndex < story.length) {
      const timer = setTimeout(() => {
        setDisplayedStory((prev) => prev + story[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 15);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, story]);

  useEffect(() => {
    const currentContainerRef = containerRef.current?.offsetHeight ?? 0;
    const currentContentRef = contentRef.current?.offsetHeight ?? 0;
    if (currentContainerRef < currentContentRef) {
      containerRef.current?.scrollTo(0, contentRef.current?.offsetHeight ?? 0);
    }
  }, [displayedStory]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      className="bg-indigo-700 bg-opacity-50 rounded-lg p-6 border-2 border-indigo-500 shadow-inner h-96 overflow-scroll"
      ref={containerRef}
    >
      {generatedImage ? (
        <>
          <img
            className="w-1/2 float-left m-4"
            src={`data:image/jpeg;base64,${generatedImage}`}
          />
          <p
            className="text-white text-lg font-serif leading-relaxed whitespace-pre-wrap"
            ref={contentRef}
          >
            {displayedStory}
          </p>
        </>
      ) : (
        <div className="flex items-center justify-center text-white text-2xl">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Weaving Story...</span>
        </div>
      )}
    </motion.div>
  );
}
