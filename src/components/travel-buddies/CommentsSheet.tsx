import React from 'react';
import { PostCommentsModal } from './PostCommentsModal';
import { Post } from '../../lib/types';

interface CommentsSheetProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

/**
 * Backward compatibility wrapper delegating to the portal-based PostCommentsModal
 */
export const CommentsSheet: React.FC<CommentsSheetProps> = ({
  post,
  isOpen,
  onClose,
  onCommentAdded,
}) => {
  return (
    <PostCommentsModal
      post={post}
      isOpen={isOpen}
      onClose={onClose}
      onCommentCountChange={onCommentAdded ? () => onCommentAdded() : undefined}
    />
  );
};
