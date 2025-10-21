import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail } from 'lucide-react';

export const ProfileSummary = ({ user, stats }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gray-900 rounded-3xl border border-red-700/30 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Profile Summary</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
          <div>
            <p className="text-sm text-gray-400">Name</p>
            <p className="font-semibold">{user?.name || 'Not set'}</p>
          </div>
          <User className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="font-semibold">{user?.email}</p>
          </div>
          <Mail className="w-5 h-5 text-gray-400" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center p-4 bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-red-500">{stats.totalPurchases}</div>
            <div className="text-sm text-gray-400">Beats Purchased</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-red-500">{stats.wishlistCount}</div>
            <div className="text-sm text-gray-400">Wishlisted</div>
          </div>
          <div className="text-center p-4 bg-gray-800 rounded-xl col-span-2">
            <div className="text-2xl font-bold text-green-500">${stats.totalSpent}</div>
            <div className="text-sm text-gray-400">Total Spent</div>
          </div>
        </div>
      </div>

      <Link
        to="/profile/edit"
        className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white text-center py-3 rounded-xl font-semibold transition-colors block border border-red-700/30 hover:border-red-500"
      >
        Edit Profile
      </Link>
    </motion.section>
  );
};