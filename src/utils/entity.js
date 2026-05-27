export const getEntityId = (entity) => {
  if(!entity) return undefined;
  if(typeof entity === 'string') return entity;
  return entity.id || entity._id;
}

export const canManagePost = (user, post) => {
  const userId = getEntityId(user);
  const authorId = getEntityId(post?.author);
  return Boolean(user && post && (user.role === 'admin' || userId === authorId));
}
