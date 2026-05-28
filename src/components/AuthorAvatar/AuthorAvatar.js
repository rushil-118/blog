import React from 'react';

export const getAuthorName = (author = {}, fallback = 'Unknown author') => author?.name || author?.username || fallback;

const AuthorAvatar = ({author = {}, fallback = 'Author', className = ''}) => {
    if(!author?.avatar){
        return null;
    }

    return (
        <div className={className}>
            <img src={author.avatar} alt={getAuthorName(author, fallback)} />
        </div>
    );
}

export default AuthorAvatar;
