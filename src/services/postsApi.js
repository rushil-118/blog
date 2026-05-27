import api from '../api/axios';

export const listPosts = (params = {}) => api.get('/posts', { params }).then((response) => response.data);

export const getPost = (idOrSlug) => api.get(`/posts/${idOrSlug}`).then((response) => response.data);

export const createPost = (post) => api.post('/posts', post).then((response) => response.data);

export const updatePost = (id, post) => api.patch(`/posts/${id}`, post).then((response) => response.data);

export const deletePost = (id) => api.delete(`/posts/${id}`).then((response) => response.data);

export const reactToPost = (id, type) => api.post(`/posts/${id}/reactions`, { type }).then((response) => response.data);

const postsApi = { listPosts, getPost, createPost, updatePost, deletePost, reactToPost };

export default postsApi;
