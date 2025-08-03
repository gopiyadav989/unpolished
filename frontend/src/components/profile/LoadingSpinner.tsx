// components/Profile/LoadingSpinner.tsx
import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-gray-600 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Loading profile...</p>
      </div>
    </div>
  );
}
