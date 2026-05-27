import React, {useCallback, useEffect, useMemo, useState} from 'react';
import "./HomePage.scss";
import { Link } from 'react-router-dom';
import BlogList from '../../components/BlogList/BlogList';
import Loader from '../../components/Loader/Loader';
import postsApi from '../../services/postsApi';

const DEFAULT_LIMIT = 6;

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async() => {
    setLoading(true);
    setError('');
    try{
      const data = await postsApi.listPosts({ page, limit: DEFAULT_LIMIT, q: query || undefined, tag: activeTag || undefined });
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || (data.posts || []).length);
    } catch(err){
      setError(err?.response?.data?.message || 'Unable to load posts.');
    } finally {
      setLoading(false);
    }
  }, [activeTag, page, query]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const tags = useMemo(() => {
    const uniqueTags = new Set();
    posts.forEach((post) => (post.tags || []).forEach((tag) => uniqueTags.add(tag)));
    return Array.from(uniqueTags).slice(0, 8);
  }, [posts]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(searchInput.trim());
  }

  const handleTag = (tag) => {
    setPage(1);
    setActiveTag((current) => current === tag ? '' : tag);
  }

  return (
    <main className="home-page bg-light-blue">
      <section className="home-hero">
        <div className="container home-hero-content">
          <p className="eyebrow font-rubik">Full-stack publishing</p>
          <h1>Discover thoughtful stories from the Blog community.</h1>
          <p className="hero-copy">Search by topic, filter by tags, and follow conversations from independent authors.</p>
          <form className="home-search" onSubmit={handleSearch} aria-label="Search posts">
            <input
              type="search"
              aria-label="Search posts"
              placeholder="Search posts by title, body, or tag..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <div className="hero-actions">
            <Link to="/posts/new" className="primary-link">Start writing</Link>
            <a href="#posts" className="secondary-link">Browse posts</a>
          </div>
        </div>
      </section>

      <section id="posts" className="section py-7">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow font-rubik">Latest articles</p>
              <h2>Fresh from the blog</h2>
            </div>
            <p>{total} {total === 1 ? 'post' : 'posts'} found</p>
          </div>

          <div className="tag-filters" aria-label="Filter posts by tag">
            <button className={!activeTag ? 'active' : ''} type="button" onClick={() => handleTag('')}>All</button>
            {tags.map((tag) => (
              <button className={activeTag === tag ? 'active' : ''} type="button" onClick={() => handleTag(tag)} key={tag}>{tag}</button>
            ))}
          </div>

          {loading && (
            <div className="home-loading" aria-label="Loading posts">
              <Loader />
              <div className="skeleton-grid">
                {[1, 2, 3].map((item) => <div className="post-skeleton" key={item} />)}
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="state-card" role="alert">
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button type="button" onClick={loadPosts}>Retry</button>
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="state-card">
              <h3>No posts found</h3>
              <p>Try clearing the search or choosing a different tag.</p>
              <button type="button" onClick={() => { setSearchInput(''); setQuery(''); setActiveTag(''); setPage(1); }}>Clear filters</button>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <>
              <BlogList blogs={posts} showPagination={false} />
              <div className="pagination-controls" aria-label="Post pagination">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
                <span>Page {page} of {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default HomePage;
