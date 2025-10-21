import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Headphones, Clock } from 'lucide-react';

export const QuickActions = () => {
  const quickLinks = [
    {
      icon: TrendingUp,
      title: "Popular Beats",
      description: "Trending right now",
      href: "/?sort=popular"
    },
    {
      icon: Headphones,
      title: "New Releases",
      description: "Fresh from the studio",
      href: "/?sort=newest"
    },
    {
      icon: Clock,
      title: "Recently Played",
      description: "Continue listening",
      href: "/?filter=recent"
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gray-900 rounded-3xl border border-red-700/30 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
      </div>
      
      <div className="space-y-3">
        {quickLinks.map((link, index) => (
          <QuickActionLink
            key={index}
            icon={link.icon}
            title={link.title}
            description={link.description}
            href={link.href}
          />
        ))}
      </div>
    </motion.section>
  );
};

const QuickActionLink = ({ icon: Icon, title, description, href }) => (
  <Link
    to={href}
    className="flex items-center gap-3 p-3 bg-gray-800 border border-red-700/30 rounded-xl hover:border-red-500 transition-all group"
  >
    <Icon className="w-5 h-5 text-red-400 group-hover:text-red-300" />
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  </Link>
);