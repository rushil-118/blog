const mongoose = require('mongoose');
const { authorSummary } = require('../utils/serializers');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
    },
    excerpt: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.reactions = {
          likes: Array.isArray(ret.likedBy) ? ret.likedBy.length : 0,
          dislikes: Array.isArray(ret.dislikedBy) ? ret.dislikedBy.length : 0,
        };
        if (ret.author && typeof ret.author === 'object' && ret.author.username) {
          ret.author = authorSummary(ret.author);
        }
        delete ret._id;
        delete ret.__v;
        delete ret.likedBy;
        delete ret.dislikedBy;
        return ret;
      },
    },
  }
);

postSchema.index({ title: 'text', body: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);
