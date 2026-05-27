import React, {useCallback, useEffect, useState} from 'react';
import "./SingleBlogPage.scss";
import { useNavigate, useParams } from 'react-router-dom';
import SingleBlog from '../../components/SingleBlog/SingleBlog';
import postsApi from '../../services/postsApi';
import commentsApi from '../../services/commentsApi';
import { getEntityId } from '../../utils/entity';

const SingleBlogPage = () => {
  const {idOrSlug} = useParams();
  const navigate = useNavigate();
  const [singleBlog, setSingleBlog] = useState({});
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPost = useCallback(async() => {
    setLoading(true);
    setError('');
    try{
      const response = await postsApi.getPost(idOrSlug);
      const post = response.post || response;
      setSingleBlog(post || {});
      setComments(response.comments || post?.comments || []);
    } catch(err){
      setError(err?.response?.data?.message || 'Unable to load post.');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const postId = getEntityId(singleBlog);

  const refreshComments = async() => {
    if(!postId) return;
    const response = await commentsApi.listComments(postId);
    setComments(response.comments || []);
  }

  const handleReact = async(type) => {
    const response = await postsApi.reactToPost(postId, type);
    setSingleBlog((current) => ({ ...current, reactions: response.reactions || response.post?.reactions || current.reactions }));
  }

  const handleCreateComment = async(body) => {
    await commentsApi.createComment(postId, body);
    await refreshComments();
  }

  const handleDeletePost = async() => {
    await postsApi.deletePost(postId);
    navigate('/dashboard');
  }

  return (
    <main className = "single-blog-page bg-light-blue">
      <header className='single-hero'>
        <div className='container'>
          <p className="eyebrow font-rubik">Blog Details</p>
          <h1>{singleBlog.title || 'Read the full story'}</h1>
        </div>
      </header>
      <section className='section py-7'>
        <div className='container'>
          <div className='section-content bg-white'>
            {error && <div className="state-card" role="alert"><p>{error}</p><button type="button" onClick={loadPost}>Retry</button></div>}
            {!error && <SingleBlog blog = {singleBlog} comments = {comments} loading={loading} onReact={handleReact} onDeletePost={handleDeletePost} onCreateComment={handleCreateComment} />}
          </div>
        </div>
      </section>
    </main>
  );
}

export default SingleBlogPage;
