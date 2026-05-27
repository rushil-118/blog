const mongoose = require('mongoose');

const authorFields = 'username name avatar role';
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const sameId = (left, right) => left && right && left.toString() === right.toString();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map(normalizeString).filter(Boolean).map((tag) => tag.toLowerCase());
  }
  if (typeof tags === 'string') {
    return tags.split(',').map(normalizeString).filter(Boolean).map((tag) => tag.toLowerCase());
  }
  return [];
};

module.exports = { authorFields, isValidObjectId, sameId, escapeRegex, normalizeString, normalizeTags };
