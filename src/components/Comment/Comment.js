import React from 'react';
import "./Comment.scss";
import AuthorAvatar, { getAuthorName } from '../AuthorAvatar/AuthorAvatar';

const Comment = ({comment}) => {
    const author = comment?.author || {};

    return (
        <div className={`blog-comments-item grid align-center${author.avatar ? ' has-avatar' : ''}`}>
            <AuthorAvatar author={author} fallback="Comment author" className="comment-img" />
            <div className='comment-info'>
                <span className='comment-info-name fw-7 text-dark-blue fs-18'>{getAuthorName(author, 'Anonymous')}</span>
                <p className='my-1 fs-15'>{comment?.body}</p>
            </div>
        </div>
    )
}

export default Comment
