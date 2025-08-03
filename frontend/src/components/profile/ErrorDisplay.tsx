// components/Profile/ErrorDisplay.tsx
interface ErrorDisplayProps {
    error?: string | null;
    onGoHome: () => void;
  }
  
  export function ErrorDisplay({ error, onGoHome }: ErrorDisplayProps) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {error || 'Profile not found'}
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The user you're looking for doesn't exist or has been removed. 
            Please check the username and try again.
          </p>
          <button
            onClick={onGoHome}
            className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  