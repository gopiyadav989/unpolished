import { useState } from 'react';
import { Reply, Trash2 } from 'lucide-react';
import { Comment } from '../../types/comment';
import { CommentForm } from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  blogAuthorId?: string;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isSubmitting?: boolean;
  depth?: number;
}

export function CommentItem({
  comment,
  currentUserId,
  blogAuthorId,
  onReply,
  onDelete,
  isSubmitting = false,
  depth = 0
}: CommentItemProps) {

  
  const [showReplyForm, setShowReplyForm] = useState(false);
  const isAuthor = currentUserId === comment.userId;
  const isBlogAuthor = currentUserId === blogAuthorId;
  const canDelete = isAuthor || isBlogAuthor;
  const canReply = currentUserId && depth < 2; // Max 3 levels (0, 1, 2)

  const handleReply = async (content: string) => {
    await onReply(comment.id, content);
    setShowReplyForm(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment? This will also delete all replies.')) {
      await onDelete(comment.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l border-gray-100 pl-4' : ''}`}>
      <div className="flex space-x-3 group">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {comment.user.profileImage ? (
              <img
                src={comment.user.profileImage}
                alt={comment.user.name || comment.user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-medium text-gray-600">
                {(comment.user.name || comment.user.username).charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm text-gray-900">
              {comment.user.name || comment.user.username}
            </span>
            {isAuthor && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Author
              </span>
            )}
            {isBlogAuthor && !isAuthor && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                Blog Author
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
            {comment.createdAt !== comment.updatedAt && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>

          {/* Content */}
          <div className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">
            {comment.content}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {canReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                disabled={isSubmitting}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center space-x-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}

            {comment.likeCount > 0 && (
              <span className="text-xs text-gray-500">
                {comment.likeCount} {comment.likeCount === 1 ? 'like' : 'likes'}
              </span>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <CommentForm
              onSubmit={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Write a reply..."
              isReply={true}
              isSubmitting={isSubmitting}
            />
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  blogAuthorId={blogAuthorId}
                  onReply={onReply}
                  onDelete={onDelete}
                  isSubmitting={isSubmitting}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}