import { useState } from 'react';
import { Send, X } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  isReply?: boolean;
  isSubmitting?: boolean;
}

export function CommentForm({ 
  onSubmit, 
  onCancel, 
  placeholder = "Write a comment...", 
  isReply = false,
  isSubmitting = false,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    try {
      await onSubmit(content.trim());
      setContent('');
      setIsFocused(false);
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className={`${isReply ? 'ml-12 mt-3' : 'mt-6'}`}>
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          rows={isFocused || content ? 3 : 1}
          maxLength={1000}
          disabled={isSubmitting}
        />
        
        {/* Character count */}
        {(isFocused || content) && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {content.length}/1000
          </div>
        )}
      </div>

      {/* Action buttons - show when focused or has content */}
      {(isFocused || content) && (
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-gray-500">
            {isReply ? 'Replying to comment' : 'Share your thoughts'}
          </div>
          
          <div className="flex items-center space-x-2">
            {(onCancel || content) && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="flex items-center space-x-1 px-4 py-1.5 bg-black text-white text-sm rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3 h-3" />
              <span>{isSubmitting ? 'Posting...' : isReply ? 'Reply' : 'Comment'}</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
}