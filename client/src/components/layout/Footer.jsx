import { Music } from "lucide-react";

export const Footer = () => (
  <footer className="py-12 border-t border-red-700/30 bg-black">
    <div className="container mx-auto px-4 text-center">
      <div className="flex justify-center items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
          <Music className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Beats by Baraju</h3>
          <p className="text-red-400 text-sm">Premium Beats & Soundpacks</p>
        </div>
      </div>
      <p className="text-gray-400 mb-2">
        Your trusted source for professional beats and soundpacks
      </p>
      <p className="text-gray-500 text-sm">
        &copy; 2025 Beats by Baraju. All rights reserved.
      </p>
    </div>
  </footer>
);