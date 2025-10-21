import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GENRES, SORT_OPTIONS } from "../../../constants";

export const BeatFilters = ({
  searchTerm,
  setSearchTerm,
  selectedGenre,
  setSelectedGenre,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  bpmRange,
  setBpmRange,
  showFilters,
  setShowFilters,
  clearFilters,
  filteredBeats,
  beats,
}) => {
  return (
    <section className="py-8 bg-gray-900/50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          {/* Search Bar */}
          <div className="flex-1 w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search beats, genres, keys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-red-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="border-red-700 text-red-400 hover:bg-red-700/20"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-red-700/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-800 rounded-xl p-6 border border-red-700/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full bg-gray-700 border border-red-700/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                >
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([parseInt(e.target.value), priceRange[1]])
                    }
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full"
                  />
                </div>
              </div>

              {/* BPM Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  BPM: {bpmRange[0]} - {bpmRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="60"
                    max="180"
                    value={bpmRange[0]}
                    onChange={(e) =>
                      setBpmRange([parseInt(e.target.value), bpmRange[1]])
                    }
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="60"
                    max="180"
                    value={bpmRange[1]}
                    onChange={(e) =>
                      setBpmRange([bpmRange[0], parseInt(e.target.value)])
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex justify-end mt-4">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-red-700 text-red-400 hover:bg-red-700/20"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}

        {/* Results Count */}
        <div className="text-center mt-4">
          <p className="text-gray-400">
            Showing {filteredBeats.length} of {beats.length} beats
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
      </div>
    </section>
  );
};
