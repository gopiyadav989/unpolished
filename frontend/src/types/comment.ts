export interface Comment {
  id: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  blogId: string;
  userId: string;
  parentId: string | null;
  
  // Populated data
  user: {
    id: string;
    name?: string;
    username: string;
    profileImage?: string;
  };
  
  // Nested replies (always an array, never undefined)
  replies: Comment[];
}

export interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  hasMore: boolean;
  total: number;
}
