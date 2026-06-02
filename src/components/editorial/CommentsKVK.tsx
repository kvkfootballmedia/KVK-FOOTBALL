import { useState } from 'react';
import { Heart, MessageCircle, ChevronDown } from 'lucide-react';

interface CommentData {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_role?: 'editor' | 'author' | 'user';
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  like_count: number;
  created_at: string;
  parent_comment_id?: string;
  replies?: CommentData[];
}

interface CommentsKVKProps {
  postId: string;
  comments: CommentData[];
  onAddComment?: (content: string) => Promise<void>;
  onLikeComment?: (commentId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CommentsKVK({
  postId,
  comments,
  onAddComment,
  onLikeComment,
  isLoading = false,
}: CommentsKVKProps) {
  const [newComment, setNewComment] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const approvedComments = comments.filter(c => c.status === 'approved' && !c.parent_comment_id);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!onLikeComment) return;

    const newLiked = new Set(likedComments);
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
    }
    setLikedComments(newLiked);

    try {
      await onLikeComment(commentId);
    } catch (error) {
      // Revert on error
      setLikedComments(likedComments);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedComments(newExpanded);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'editor':
        return 'bg-red-100 text-red-700';
      case 'author':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleName = (role?: string) => {
    switch (role) {
      case 'editor':
        return 'Rédacteur';
      case 'author':
        return 'Auteur';
      default:
        return null;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins}m`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;

    return date.toLocaleDateString('fr-FR');
  };

  const truncateText = (text: string, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const CommentItem = ({ comment, isReply = false }: { comment: CommentData; isReply?: boolean }) => {
    const isTruncated = comment.content.length > 200;
    const isExpanded = expandedComments.has(comment.id);
    const displayText = isExpanded ? comment.content : truncateText(comment.content);
    const replies = comments.filter(c => c.parent_comment_id === comment.id && c.status === 'approved');

    return (
      <div className={`${isReply ? 'ml-8 mt-3' : 'border-t border-gray-200 pt-4'}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author_avatar ? (
              <img
                src={comment.author_avatar}
                alt={comment.author_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">
                {comment.author_name}
              </span>
              {comment.author_role && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(comment.author_role)}`}>
                  {getRoleName(comment.author_role)}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>

            {/* Comment Text */}
            <p className="text-gray-700 text-sm mt-1 leading-relaxed break-words">
              {displayText}
            </p>

            {/* Show More Button */}
            {isTruncated && (
              <button
                onClick={() => toggleExpanded(comment.id)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
              >
                {isExpanded ? 'Afficher moins' : 'Afficher plus'}
              </button>
            )}

            {/* Actions */}
            <div className="flex gap-4 mt-2">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center gap-1 text-xs transition ${
                  likedComments.has(comment.id)
                    ? 'text-red-600'
                    : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${likedComments.has(comment.id) ? 'fill-current' : ''}`} />
                {comment.like_count > 0 && <span>{comment.like_count}</span>}
              </button>
              {replies.length > 0 && (
                <button
                  onClick={() => toggleExpanded(comment.id)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  {replies.length} réponse{replies.length > 1 ? 's' : ''}
                </button>
              )}
            </div>

            {/* Replies */}
            {replies.length > 0 && isExpanded && (
              <div className="mt-3 space-y-3">
                {replies.map(reply => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    isReply={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-8 border-t-2 border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        Commentaires ({approvedComments.length})
      </h3>

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8 pb-8 border-b border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Laisser un commentaire
        </label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Partagez votre avis sur cet article..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-vertical min-h-24 text-sm"
          disabled={isSubmitting}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition"
          >
            {isSubmitting ? 'Publication...' : 'Publier le commentaire'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">
          Chargement des commentaires...
        </div>
      ) : approvedComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun commentaire pour le moment. Soyez le premier à commenter !
        </div>
      ) : (
        <div className="space-y-4">
          {approvedComments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {/* Moderation Notice */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <p>
          <strong>Note:</strong> Les commentaires sont modérés et approuvés par notre équipe avant publication. Merci de respecter les bonnes pratiques de communication.
        </p>
      </div>
    </section>
  );
}
