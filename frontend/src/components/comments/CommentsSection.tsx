// Updated CommentsSection with consolidated handler

import { useState, useEffect } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Comment, CommentState } from '../../types/comment';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { BACKEND_URL } from '../../config';
import axios from 'axios';

interface CommentsSectionProps {
  blogId: string;
  blogAuthorId: string;
  allowComments: boolean;
  initialCommentCount?: number;
}




export function CommentsSection({
  blogId,
  blogAuthorId,
  allowComments,
  initialCommentCount = 0
}: CommentsSectionProps) {

  const [state, setState] = useState<CommentState>({
    comments: [],
    loading: true,
    error: null,
    submitting: false,
    hasMore: false,
    total: initialCommentCount
  });

  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    setIsLoggedIn(!!token);
    setCurrentUserId(userId || undefined);
  }, []);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [blogId]);




  const loadComments = async (offset = 0) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/comments/${blogId}?limit=20&offset=${offset}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });

      const { comments, pagination } = response.data;

      // Ensure all comments have replies arrays (recursively)
      const normalizeComment = (comment: Comment): Comment => ({
        ...comment,
        replies: (comment.replies || []).map(normalizeComment)
      })

      const normalizedComments = comments.map(normalizeComment);



      setState(prev => {
        const allComments = offset === 0 ? normalizedComments : [...prev.comments, ...normalizedComments];
        const actualTotal = countTotalComments(allComments);

        return {
          ...prev,
          comments: allComments,
          loading: false,
          hasMore: pagination.hasMore,
          total: actualTotal
        };
      });
    } catch (error: any) {
      console.error('Error loading comments:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.error || 'Failed to load comments'
      }));
    }
  };



  // replying and commenting
  const handleSubmitComment = async (content: string, parentId?: string) => {
    if (!isLoggedIn) {
      window.toast?.error('Please sign in to comment');
      return;
    }

    try {
      setState(prev => ({ ...prev, submitting: true }));

      const token = localStorage.getItem('token');
      const requestBody: { content: string; parentId?: string } = { content };

      // Only add parentId if it's provided (for replies)
      if (parentId) {
        requestBody.parentId = parentId;
      }

      const response = await axios.post(`${BACKEND_URL}/comments/${blogId}`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newComment = response.data.comment;
      const normalizedComment = {
        ...newComment,
        replies: []
      };

      setState(prev => {
        let updatedComments;

        if (parentId) {
          // adding the reply to its parent
          updatedComments = addReplyToComments(prev.comments, parentId, normalizedComment);
        } else {
          // if its a top comment add it to top
          updatedComments = [normalizedComment, ...prev.comments];
        }

        const actualTotal = prev.total + 1;

        return {
          ...prev,
          comments: updatedComments,
          submitting: false,
          total: actualTotal
        };
      });

      const messageType = parentId ? 'Reply' : 'Comment';
      window.toast?.success(`${messageType} posted successfully`);

    } catch (error: any) {
      console.error('Error submitting comment:', error);
      setState(prev => ({ ...prev, submitting: false }));
      const messageType = parentId ? 'reply' : 'comment';
      window.toast?.error(error.response?.data?.error || `Failed to post ${messageType}`);
    }
  };


  const handleDelete = async (commentId: string) => {
    try {
      setState(prev => ({ ...prev, submitting: true }));

      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Removeing comment and all its nested comment, 
      setState(prev => {
        const updatedComments = removeCommentFromList(prev.comments, commentId);
        const actualTotal = countTotalComments(updatedComments);

        return {
          ...prev,
          comments: updatedComments,
          submitting: false,
          total: actualTotal
        };
      });

      window.toast?.success('Comment deleted successfully');
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      setState(prev => ({ ...prev, submitting: false }));
      window.toast?.error(error.response?.data?.error || 'Failed to delete comment');
    }
  };


  const addReplyToComments = (comments: Comment[], parentId: String, reply: Comment): Comment[] => {

    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        }
      }

      return {
        ...comment,
        replies: addReplyToComments(comment.replies, parentId, reply)
      }

    })

  }

  // removing a comment and its child comment

  //mutating value inside the filter is not recommended
  // const removeCommentFromList = (comments: Comment[], commentId: string): Comment[] => {
  //   return comments.filter(comment => {
  //     if(comment.id == commentId){
  //       return false;
  //     }

  //     comment.replies = removeCommentFromList(comment.replies, commentId);

  //     return true;
  //   })
  // }

  // so use map, whener there is mutation
  const removeCommentFromList = (comments: Comment[], commentId: string): Comment[] => {
    return comments
      .filter(comment => comment.id !== commentId)
      .map(comment => ({
        ...comment,
        replies: removeCommentFromList(comment.replies || [], commentId)
      }))
  }


  // Helper function to count total comments including all nested replies
  const countTotalComments = (comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + countTotalComments(comment.replies || []);
    }, 0);
  };

  if (!allowComments) {
    return (
      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="text-center text-gray-500">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Comments are disabled for this post</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({state.total})
        </h3>
      </div>

      {/* Comment form */}
      {isLoggedIn ? (
        <CommentForm
          onSubmit={(content) => handleSubmitComment(content)}
          isSubmitting={state.submitting}
        />
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-600 mb-2">Sign in to join the conversation</p>
          <a
            href="/signin"
            className="text-black hover:underline font-medium"
          >
            Sign in
          </a>
        </div>
      )}

      {/* Comments list */}
      <div className="mt-8">
        {state.loading && state.comments.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : state.error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{state.error}</p>
            <button
              onClick={() => loadComments()}
              className="px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        ) : state.comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {state.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                blogAuthorId={blogAuthorId}
                onReply={(parentId, content) => handleSubmitComment(content, parentId)}
                onDelete={handleDelete}
                isSubmitting={state.submitting}
              />
            ))}



            {/* Load more button */}
            {state.hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={() => loadComments(state.comments.length)}
                  disabled={state.loading}
                  className="px-6 py-2 bg-gray-100 rounded-full hover:bg-gray-200 disabled:opacity-50"
                >
                  {state.loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    'Load more comments'
                  )}
                </button>
              </div>
            )}


          </div>
        )}
      </div>
      
    </div>
  );
}