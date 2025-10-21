import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export const LoginPrompt = ({ user, onLogin }) => {
  if (user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-40"
    >
      <div className="bg-gray-900 border border-red-700 rounded-xl p-4 shadow-2xl">
        <p className="text-white text-sm mb-3">Login to purchase beats instantly</p>
        <Button onClick={onLogin} className="bg-red-600 hover:bg-red-700 w-full">
          Sign In to Continue
        </Button>
      </div>
    </motion.div>
  );
};