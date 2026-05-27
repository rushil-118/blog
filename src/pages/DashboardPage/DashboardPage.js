import React, {useCallback, useEffect, useState} from 'react';
import './DashboardPage.scss';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/authContext';
import postsApi from '../../services/postsApi';
import { getEntityId } from '../../utils/entity';

const DashboardPage = () => {
    const { user } = useAuthContext();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const userId = getEntityId(user);

    const loadPosts = useCallback(async() => {
        if(!userId) return;
        setLoading(true);
        setError('');
        try{
            const data = await postsApi.listPosts({ author: userId, limit: 50 });
            setPosts(data.posts || []);
        } catch(err){
            setError(err?.response?.data?.message || 'Unable to load your posts.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const handleDelete = async(id) => {
        setDeleteError('');
        try{
            await postsApi.deletePost(id);
            setPosts((current) => current.filter((post) => getEntityId(post) !== id));
        } catch(err){
            setDeleteError(err?.response?.data?.message || 'Unable to delete post.');
        }
    }

    return (
        <main className="dashboard-page bg-light-blue">
            <section className="container py-7">
                <div className="dashboard-header">
                    <div>
                        <p className="eyebrow font-rubik">Author workspace</p>
                        <h1>Dashboard</h1>
                        <p>Welcome{user?.name ? `, ${user.name}` : ''}. Manage your published stories here.</p>
                    </div>
                    <Link className="primary-link" to="/posts/new">Create post</Link>
                </div>

                {loading && <p>Loading your posts...</p>}
                {error && <div className="state-card" role="alert"><p>{error}</p><button type="button" onClick={loadPosts}>Retry</button></div>}
                {deleteError && <div className="state-card" role="alert"><p>{deleteError}</p></div>}
                {!loading && !error && posts.length === 0 && (
                    <div className="state-card">
                        <h2>No posts yet</h2>
                        <p>Write your first story and share it with readers.</p>
                        <Link to="/posts/new">Create your first post</Link>
                    </div>
                )}
                {!loading && !error && posts.length > 0 && (
                    <div className="dashboard-list">
                        {posts.map((post) => {
                            const postId = getEntityId(post);
                            return (
                                <article className="dashboard-card" key={postId}>
                                    <div>
                                        <h2><Link to={`/blog/${post.slug || postId}`}>{post.title}</Link></h2>
                                        <p>{post.excerpt || `${(post.body || '').slice(0, 140)}...`}</p>
                                        <span>{(post.tags || []).join(', ')}</span>
                                    </div>
                                    <div className="dashboard-actions">
                                        <Link to={`/posts/${postId}/edit`}>Edit</Link>
                                        <button type="button" onClick={() => handleDelete(postId)}>Delete</button>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}

export default DashboardPage;
