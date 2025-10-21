import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const LoginPrompt = ({ user }) => {
  if (user) return null;

  const handleRedirectToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-40"
    >
      <div className="bg-gray-900 border border-red-700 rounded-xl p-4 shadow-2xl max-w-sm">
        <p className="text-white text-sm mb-3">Login to purchase beats and save to wishlist</p>
        <Button 
          onClick={handleRedirectToLogin}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          Sign In to Continue
        </Button>
      </div>
    </motion.div>
  );
};