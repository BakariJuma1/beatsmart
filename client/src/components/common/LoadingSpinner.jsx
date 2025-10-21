import { Loader } from "lucide-react";

export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex justify-center items-center py-8">
    <Loader className="w-8 h-8 text-red-600 animate-spin mr-3" />
    <span className="text-gray-300">{message}</span>
  </div>
);