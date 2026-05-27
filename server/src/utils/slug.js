const slugify = require('slugify');
const Post = require('../models/Post');

const baseSlugForTitle = (title) => slugify(title, { lower: true, strict: true, trim: true }) || 'post';

const createUniqueSlug = async (title, excludeId) => {
  const baseSlug = baseSlugForTitle(title);
  let slug = baseSlug;
  let counter = 2;

  // eslint-disable-next-line no-await-in-loop
  while (await Post.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

module.exports = { createUniqueSlug, baseSlugForTitle };
