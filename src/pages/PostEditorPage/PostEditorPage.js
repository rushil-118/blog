import React, {useEffect, useState} from 'react';
import './PostEditorPage.scss';
import { useNavigate, useParams } from 'react-router-dom';
import postsApi from '../../services/postsApi';

const initialForm = { title: '', excerpt: '', coverImage: '', tags: '', body: '' };

const normalizePost = (post) => ({
    title: post.title || '',
    excerpt: post.excerpt || '',
    coverImage: post.coverImage || '',
    tags: (post.tags || []).join(', '),
    body: post.body || ''
});

const PostEditorPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(Boolean(id));
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        const loadPost = async() => {
            if(!id) return;
            setLoading(true);
            setError('');
            try{
                const data = await postsApi.getPost(id);
                setFormData(normalizePost(data.post || data));
            } catch(err){
                setError(err?.response?.data?.message || 'Unable to load post.');
            } finally {
                setLoading(false);
            }
        }
        loadPost();
    }, [id]);

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    }

    const buildPayload = () => ({
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        coverImage: formData.coverImage.trim(),
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        body: formData.body.trim()
    });

    const handleSubmit = async(event) => {
        event.preventDefault();
        setValidationError('');
        setError('');
        const payload = buildPayload();
        if(!payload.title || !payload.body){
            setValidationError('Title and body are required.');
            return;
        }

        setSubmitting(true);
        try{
            const data = id ? await postsApi.updatePost(id, payload) : await postsApi.createPost(payload);
            const savedPost = data.post || data;
            navigate(`/blog/${savedPost.slug || savedPost.id || savedPost._id}`);
        } catch(err){
            setError(err?.response?.data?.message || 'Unable to save post.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="post-editor-page bg-light-blue">
            <section className="container py-7">
                <div className="editor-shell">
                    <p className="eyebrow font-rubik">{id ? 'Edit story' : 'Create story'}</p>
                    <h1>{id ? 'Edit Post' : 'Create Post'}</h1>
                    {loading ? <p>Loading post...</p> : (
                        <form className="post-editor-form" onSubmit={handleSubmit}>
                            {(validationError || error) && <p role="alert" className="form-error">{validationError || error}</p>}
                            <div className="form-elem">
                                <label htmlFor="title">Title</label>
                                <input id="title" name="title" value={formData.title} onChange={handleChange} />
                            </div>
                            <div className="form-elem">
                                <label htmlFor="excerpt">Excerpt</label>
                                <input id="excerpt" name="excerpt" value={formData.excerpt} onChange={handleChange} />
                            </div>
                            <div className="form-elem">
                                <label htmlFor="coverImage">Cover image URL</label>
                                <input id="coverImage" name="coverImage" value={formData.coverImage} onChange={handleChange} />
                            </div>
                            <div className="form-elem">
                                <label htmlFor="tags">Tags</label>
                                <input id="tags" name="tags" value={formData.tags} onChange={handleChange} placeholder="react, design, api" />
                            </div>
                            <div className="form-elem">
                                <label htmlFor="body">Body</label>
                                <textarea id="body" name="body" value={formData.body} onChange={handleChange} rows="12" />
                            </div>
                            <button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save post'}</button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
}

export default PostEditorPage;
