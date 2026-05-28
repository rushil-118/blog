import React, { useMemo, useState } from 'react';
import "./SingleBlog.scss";
import {BiCalendar, BiCommentDots, BiDislike, BiLike, BiUser} from 'react-icons/bi';
import Comment from '../Comment/Comment';
import {Link} from "react-router-dom";
import Loader from '../Loader/Loader';
import { useAuthContext } from '../../context/authContext';
import formatDate from '../../utils/formatDate';
import { canManagePost, getEntityId } from '../../utils/entity';
import AuthorAvatar, { getAuthorName } from '../AuthorAvatar/AuthorAvatar';

const PostMeta = ({author, blog, commentCount}) => (
  <div className='blog-info flex align-center'>
    <div className='blog-info-item flex align-center'>
      <BiUser className='text-mid-blue' />
      <span className='blog-info-item-text font-rubik fw-5'>{getAuthorName(author, 'Unknown author')}</span>
    </div>
    <div className='blog-info-item flex align-center'>
      <BiCalendar className='text-mid-blue' />
      <span className='blog-info-item-text font-rubik fw-5'>{formatDate(blog.createdAt || blog.updatedAt)}</span>
    </div>
    <div className='blog-info-item flex align-center'>
      <BiCommentDots className='text-mid-blue' />
      <span className='blog-info-item-text font-rubik fw-5'>{commentCount} comment(s)</span>
    </div>
  </div>
)

const AuthorCard = ({author}) => (
  <aside className='blog-author my-5'>
    <AuthorAvatar author={author} fallback="Author" className="blog-author-l" />
    <div className='blog-author-r'>
      <p className='fs-18 fw-6 author-name'>{getAuthorName(author, 'Unknown author')}</p>
      {author.username && <p className='fs-16 author-username'>@{author.username}</p>}
      {author.bio && <p>{author.bio}</p>}
    </div>
  </aside>
)

const ReactionControls = ({isAuthenticated, reactions, onReact}) => (
  <div className="blog-reactions flex align-center">
    <span className="reaction-count"><BiLike /> {reactions.likes || 0}</span>
    <span className="reaction-count"><BiDislike /> {reactions.dislikes || 0}</span>
    {isAuthenticated ? (
      <>
        <button type="button" onClick={() => onReact('like')}>Like</button>
        <button type="button" onClick={() => onReact('dislike')}>Dislike</button>
        <button type="button" onClick={() => onReact('clear')}>Clear reaction</button>
      </>
    ) : <Link to="/login">Log in to react</Link>}
  </div>
)

const CommentForm = ({commentBody, commentError, submittingComment, onBodyChange, onSubmit}) => (
  <form className="comment-form" onSubmit={onSubmit}>
    <label htmlFor="comment-body">Add a comment</label>
    <textarea id="comment-body" value={commentBody} onChange={(event) => onBodyChange(event.target.value)} rows="4" />
    {commentError && <p role="alert" className="form-error">{commentError}</p>}
    <button type="submit" disabled={submittingComment}>{submittingComment ? 'Posting...' : 'Post comment'}</button>
  </form>
)

const CommentList = ({comments}) => (
  <div className='blog-comments-list grid'>
    {comments.length ? comments.map(comment => (<Comment comment = {comment} key = {getEntityId(comment)} />)) : <p>No comments yet. Be the first to comment.</p>}
  </div>
)

const PostActions = ({blog, deleting, onDelete}) => {
  const blogId = getEntityId(blog);
  return (
    <div className="author-actions">
      <Link to={`/posts/${blogId}/edit`}>Edit post</Link>
      <button type="button" onClick={onDelete} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete post'}</button>
    </div>
  );
}

const SingleBlog = ({blog = {}, comments = [], loading = false, onReact, onDeletePost, onCreateComment}) => {
  const { isAuthenticated, user } = useAuthContext();
  const [reactionError, setReactionError] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const author = blog.author || {};
  const reactions = blog.reactions || { likes: 0, dislikes: 0 };
  const editable = useMemo(() => canManagePost(user, blog), [user, blog]);

  if(loading){
    return(<Loader />);
  }

  const handleReaction = async(type) => {
    if(!getEntityId(blog)) return;
    setReactionError('');
    try{
      await onReact?.(type);
    } catch(err){
      setReactionError(err?.response?.data?.message || 'Unable to update reaction');
    }
  }

  const handleCommentSubmit = async(event) => {
    event.preventDefault();
    if(!commentBody.trim()){
      setCommentError('Comment cannot be empty.');
      return;
    }
    setSubmittingComment(true);
    setCommentError('');
    try{
      await onCreateComment?.(commentBody.trim());
      setCommentBody('');
    } catch(err){
      setCommentError(err?.response?.data?.message || 'Unable to add comment');
    } finally {
      setSubmittingComment(false);
    }
  }

  const handleDelete = async() => {
    setDeleting(true);
    setDeleteError('');
    try{
      await onDeletePost?.();
    } catch(err){
      setDeleteError(err?.response?.data?.message || 'Unable to delete post.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <article className='blog-single'>
      <div className='blog-details'>
        {blog.coverImage && <img className="single-cover" src={blog.coverImage} alt="" />}
        <PostMeta author={author} blog={blog} commentCount={comments?.length || 0} />

        <h1 className='blog-title text-dark-blue'>{blog?.title}</h1>
        {blog.excerpt && <p className="blog-excerpt">{blog.excerpt}</p>}
        <div className='blog-text'>{(blog?.body || '').split('\n').map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>

        <div className='blog-tags flex align-center my-4'>
          <span className='blog-tags-title'>Tags:</span>
          <div className='blog-tags-list flex align-center'>
            {(blog?.tags || []).map((tag) => (
              <span className='blog-tags-item fs-13 font-rubik text-uppercase text-white ls-1' key = {tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="post-toolbar">
          <ReactionControls isAuthenticated={isAuthenticated} reactions={reactions} onReact={handleReaction} />
          {editable && <PostActions blog={blog} deleting={deleting} onDelete={handleDelete} />}
        </div>
        {reactionError && <p role="alert" className="form-error">{reactionError}</p>}
        {deleteError && <p role="alert" className="form-error">{deleteError}</p>}
      </div>

      <AuthorCard author={author} />

      <section className='blog-comments'>
        <h2 className='font-rubik my-3 fw-6'>Comments</h2>
        {isAuthenticated ? (
          <CommentForm commentBody={commentBody} commentError={commentError} submittingComment={submittingComment} onBodyChange={setCommentBody} onSubmit={handleCommentSubmit} />
        ) : <p><Link to="/login">Log in</Link> to join the conversation.</p>}
        <CommentList comments={comments} />
      </section>
    </article>
  )
}

export default SingleBlog;
