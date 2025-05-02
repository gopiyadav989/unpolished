import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import cacheService from "../cacheService";

interface InterestBarProps {
  onInterestChange: (interest: string) => void;
}

export function InterestBar({ onInterestChange }: InterestBarProps) {
  const [interests, setInterests] = useState(["For You", "Web Development", "Science", "Elon Musk"]);
  const [activeFilter, setActiveFilter] = useState("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);



  // Initialize interest only once
  useEffect(() => {

    if (initializedRef.current) return;

    const initializeInterest = async () => {
      try {
        const storedInterest = await cacheService.getActiveInterest();
        if (storedInterest) {
          setActiveFilter(storedInterest);
          onInterestChange(storedInterest);
        } else {
          await cacheService.setActiveInterest("For You");
          setActiveFilter("For You");
          onInterestChange("For You");
        }
        initializedRef.current = true;
      } catch (error) {
        console.error("Error initializing interest:", error);
      }
    };

    initializeInterest();
  }, []);


  // Handle adding a new interest
  const handleMoreClick = () => {
    const newInterest = prompt("Enter a new interest:");
    if (newInterest && newInterest.trim() !== "") {
      const trimmedInterest = newInterest.trim();

      if (!interests.includes(trimmedInterest)) {
        // backend call to be put interest in perticualr user
        setInterests(prev => [...prev, trimmedInterest]);
      }

      handleInterestSelect(trimmedInterest);
    }
  };

  // Handle selecting an interest
  const handleInterestSelect = async (interest: string) => {
    setActiveFilter(interest);
    await cacheService.setActiveInterest(interest);
    onInterestChange(interest);
  };





  // Handle scrolling the interest bar
  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 200;
    const currentScroll = scrollContainerRef.current.scrollLeft;

    scrollContainerRef.current.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };

  // Set up keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handleScroll('left');
      else if (e.key === "ArrowRight") handleScroll('right');
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Memoize checkScrollPosition to prevent recreation on each render
  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Set up scroll position checking
  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, [checkScrollPosition]);




  return (
    <div className="px-4 max-w-5xl relative">


      {/* left side arrow */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-white to-transparent pr-5 pl-2 h-full flex items-center"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
      )}




      {/* Categories */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {interests.map((interest, i) => (
          <button
            key={i}
            onClick={() => handleInterestSelect(interest)}
            className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-full transition-colors ${activeFilter === interest
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            aria-pressed={activeFilter === interest}
          >
            {interest}
          </button>
        ))}

        {/* Add more button */}
        <button
          onClick={handleMoreClick}
          className="flex items-center gap-1 whitespace-nowrap px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
          aria-label="Add more interests"
        >
          <Plus size={16} />
          <span>More</span>
        </button>
      </div>




      {/* Right scroll arrow */}
      {showRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-white to-transparent pl-5 pr-2 h-full flex items-center"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-gray-500" />
        </button>
      )}


    </div>
  );
}