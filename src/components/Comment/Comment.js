import React from 'react';
import "./Comment.scss";
import authorImage from "../../assets/images/author.png";

const Comment = ({comment}) => {
    const author = comment?.author || {};

    return (
        <div className='blog-comments-item grid align-center' key = {comment.id}>
            <div className='comment-img'>
                <img src = {author.avatar || authorImage} alt = "" />
            </div>
            <div className='comment-info'>
                <span className='comment-info-name fw-7 text-dark-blue fs-18'>{author.name || author.username || 'Anonymous'}</span>
                <p className='my-1 fs-15'>{comment?.body}</p>
            </div>
        </div>
    )
}

export default Comment
