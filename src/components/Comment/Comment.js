import React from 'react';
import "./Comment.scss";

const Comment = ({comment}) => {
    const author = comment?.author || {};

    return (
        <div className={`blog-comments-item grid align-center${author.avatar ? ' has-avatar' : ''}`} key = {comment.id}>
            {author.avatar && (
                <div className='comment-img'>
                    <img src = {author.avatar} alt = {author.name || author.username || 'Comment author'} />
                </div>
            )}
            <div className='comment-info'>
                <span className='comment-info-name fw-7 text-dark-blue fs-18'>{author.name || author.username || 'Anonymous'}</span>
                <p className='my-1 fs-15'>{comment?.body}</p>
            </div>
        </div>
    )
}

export default Comment
