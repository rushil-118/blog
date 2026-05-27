import React, {useState} from 'react';
import "./BlogList.scss";
import {BiCommentDots, BiDislike, BiLike, BiUser} from "react-icons/bi";
import { Link } from 'react-router-dom';
import Pagination from '../Pagination/Pagination';
import Loader from '../Loader/Loader';
import formatDate from '../../utils/formatDate';
import { getEntityId } from '../../utils/entity';

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=80';

const BlogList = ({blogs = [], showPagination = true, loading = false}) => {
    const blogLimit = 6;
    const [paginate, setPaginate] = useState(1 * blogLimit);
    const paginateHandler = (value) => setPaginate(value * blogLimit);
    if(loading){ return (<Loader />) }

    if(!blogs.length){
        return <p className="font-rubik fs-18">No blogs found.</p>;
    }

    const visibleBlogs = showPagination ? blogs.slice(paginate - blogLimit, paginate) : blogs;

    return (
        <>
            <div className = "blog-items grid my-6">
                {visibleBlogs.map(blog => {
                    const reactions = blog.reactions || { likes: 0, dislikes: 0 };
                    const excerpt = blog.excerpt || blog.body || '';
                    const author = blog.author || {};
                    const commentCount = blog.commentCount ?? blog.commentsCount ?? blog.comments?.length;
                    const blogId = getEntityId(blog);
                    const blogPath = blog.slug || blogId;
                    return (
                        <article className = "blog-item" key = {blogId || blog.slug}>
                            <Link to = {`/blog/${blogPath}`} className="blog-item-cover" aria-label={`Read ${blog.title}`}>
                                <img src={blog.coverImage || FALLBACK_COVER} alt="" />
                            </Link>
                            <div className="blog-item-body">
                                <div className="blog-item-meta font-rubik">
                                    <span><BiUser /> {author.name || author.username || 'Unknown author'}</span>
                                    <span>{formatDate(blog.createdAt || blog.updatedAt, 'short')}</span>
                                </div>
                                <Link to = {`/blog/${blogPath}`} className='blog-item-title fw-6 fs-22 font-rubik'>{blog.title}</Link>
                                <p className='blog-item-text'>{excerpt.substring(0, 150)}{excerpt.length > 150 ? '...' : ''}</p>
                                <div className='blog-item-tags'>
                                    {(blog.tags || []).map((tag) => (
                                        <span className='blog-item-tags-single fs-13 font-rubik text-uppercase' key = {tag}>{tag}</span>
                                    ))}
                                </div>
                                <div className='blog-item-footer font-rubik'>
                                    <span><BiLike /> {reactions.likes || 0}</span>
                                    <span><BiDislike /> {reactions.dislikes || 0}</span>
                                    {commentCount !== undefined && <span><BiCommentDots /> {commentCount}</span>}
                                    <Link to = {`/blog/${blogPath}`} className = "read-more-btn font-rubik fw-5">Read More</Link>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>
            {showPagination && <Pagination noOfBlogs = {blogs.length} paginateHandler = {paginateHandler} />}
        </>
    )
}

export default BlogList;
