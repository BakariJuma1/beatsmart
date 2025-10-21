import { Button } from "@/components/ui/button";

export const ErrorDisplay = ({ error, onRetry }) => (
  <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 max-w-md mx-auto mb-6">
    <p className="text-red-400">Error: {error}</p>
    {onRetry && (
      <Button 
        onClick={onRetry} 
        className="mt-2 bg-red-600 hover:bg-red-700"
        size="sm"
      >
        Retry
      </Button>
    )}
  </div>
);