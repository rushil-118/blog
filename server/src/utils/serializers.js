const authorSummary = (author) => {
  if (!author || !author._id) return author;
  return {
    id: author._id.toString(),
    username: author.username,
    name: author.name,
    avatar: author.avatar,
    role: author.role,
  };
};

module.exports = { authorSummary };
