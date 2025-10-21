import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, Search, User, LogOut, Menu, X, LayoutDashboard, ShoppingCart, Headphones } from "lucide-react";
import { useAuth } from "../context/AuthContext"; // Adjust path as needed

const Navbar = () => {
  const { user, logout, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        console.log("Logged out successfully");
        setIsMenuOpen(false);
      } else {
        console.error("Logout failed:", result.message);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-lg border-b border-red-700/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Beats by Baraju</h1>
              <p className="text-xs text-red-400">Premium Beats & Soundpacks</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/beat-store" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              <Headphones className="w-4 h-4" />
              Beat Store
            </Link>
            <Link to="/soundpacks" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
              <ShoppingCart className="w-4 h-4" />
              Soundpacks
            </Link>
            
            {/* Show dashboard link for logged-in users */}
            {user && (
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors flex items-center gap-1">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Search & Auth */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-300 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* User Profile Info */}
                <div className="flex items-center gap-2 text-gray-300">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-white">
                      {user.displayName || user.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-red-400 capitalize">
                      {role || 'artist'}
                    </div>
                  </div>
                </div>

                <Link to="/dashboard">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-red-700/20">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="border-red-700 text-red-400 hover:bg-red-700/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-red-700/20">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Sign Up Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="hidden md:block mt-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search beats, genres, producers..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-red-700/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-red-700/30 pt-4">
            <div className="flex flex-col gap-3">
              <Link 
                to="/beat-store" 
                className="text-gray-300 hover:text-white py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Headphones className="w-4 h-4" />
                Beat Store
              </Link>
              <Link 
                to="/soundpacks" 
                className="text-gray-300 hover:text-white py-2 flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-4 h-4" />
                Soundpacks
              </Link>
              
              <div className="border-t border-red-700/30 pt-3 mt-2">
                {user ? (
                  <>
                    {/* User Info in Mobile */}
                    <div className="flex items-center gap-3 mb-3 p-2 bg-gray-800/50 rounded-lg">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">
                          {user.displayName || user.email?.split('@')[0]}
                        </div>
                        <div className="text-xs text-red-400 capitalize">
                          {role || 'artist'}
                        </div>
                      </div>
                    </div>

                    <Link 
                      to="/dashboard" 
                      className="block text-gray-300 hover:text-white py-2 flex items-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }} 
                      className="block text-red-400 hover:text-red-300 py-2 flex items-center gap-2 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block text-gray-300 hover:text-white py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="block text-red-400 hover:text-red-300 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;