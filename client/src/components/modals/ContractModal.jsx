import { motion } from "framer-motion";
import { X, Download, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ContractModal = ({ purchasedBeat, onClose }) => {
  if (!purchasedBeat) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-red-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">🎉 Purchase Successful!</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white">{purchasedBeat.title}</h4>
              <p className="text-gray-400 text-sm">{purchasedBeat.genre} • {purchasedBeat.bpm} BPM</p>
            </div>
          </div>
        </div>

        <p className="text-gray-300 mb-6">
          Your beat has been purchased successfully! Download your files and contract below.
        </p>

        <div className="space-y-3">
          <Button className="w-full bg-red-600 hover:bg-red-700">
            <Download className="w-4 h-4 mr-2" />
            Download Beat & Stems
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-red-700 text-red-400 hover:bg-red-700/20"
            asChild
          >
            <a href={purchasedBeat.contract_url} target="_blank" rel="noopener noreferrer">
              Download License Contract
            </a>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};