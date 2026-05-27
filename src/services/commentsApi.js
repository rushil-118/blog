import api from '../api/axios';

export const listComments = (postId) => api.get(`/posts/${postId}/comments`).then((response) => response.data);

export const createComment = (postId, body) => api.post(`/posts/${postId}/comments`, { body }).then((response) => response.data);

export const deleteComment = (id) => api.delete(`/comments/${id}`).then((response) => response.data);

const commentsApi = { listComments, createComment, deleteComment };

export default commentsApi;
