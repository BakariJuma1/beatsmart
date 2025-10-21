import { useState, useEffect, Suspense, lazy } from "react";
import { Loader } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const HeroSection = lazy(() => import("@/components/home/HeroSection"));
const SearchFilterBar = lazy(() => import("@/components/home/SearchFilterBar"));
const BeatGrid = lazy(() => import("@/components/home/BeatGrid"));
const FeaturedSection = lazy(() => import("@/components/home/FeaturedSection"));

export default function Home() {
  const [beats, setBeats] = useState([]);
  const [filteredBeats, setFilteredBeats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 500);

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const response = await fetch("https://beatsmart.onrender.com/beats");
        const data = await response.json();
        setBeats(data);
        setFilteredBeats(data);
      } catch (error) {
        console.error("Error fetching beats:", error);
      }
    };
    fetchBeats();
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setFilteredBeats(beats);
    } else {
      const query = debouncedQuery.toLowerCase();
      const filtered = beats.filter((beat) => {
        const title =
          typeof beat.title === "string" ? beat.title.toLowerCase() : "";
        const producer =
          typeof beat.producer === "string" ? beat.producer.toLowerCase() : "";
        return title.includes(query) || producer.includes(query);
      });
      setFilteredBeats(filtered);
    }
  }, [debouncedQuery, beats]);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen text-white">
          <Loader className="animate-spin mr-2" /> Loading beats...
        </div>
      }
    >
      <div className="space-y-8 p-4 md:p-8">
        <HeroSection />
     
        <SearchFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <FeaturedSection beats={beats.slice(0, 4)} />
        <BeatGrid beats={filteredBeats} />
      </div>
    </Suspense>
  );
}
