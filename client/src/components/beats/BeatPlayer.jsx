import { Music, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BeatPlayer = ({ 
  playingBeat, 
  currentBeat, 
  audioElement, 
  onClose 
}) => {
  if (!playingBeat) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-red-700 p-4">
      <div className="container mx-auto flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-red-500 text-sm font-semibold">Now Playing Preview</p>
            <p className="text-gray-300 text-sm">{currentBeat?.title}</p>
          </div>
        </div>
        <audio 
          ref={audioElement}
          controls 
          autoPlay 
          className="flex-1 max-w-md" 
          onEnded={onClose}
          onError={() => {
            alert("Error playing audio preview");
            onClose();
          }}
        >
          <source src={playingBeat} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4 mr-2" />
          Close
        </Button>
      </div>
    </div>
  );
};