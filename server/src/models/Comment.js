const mongoose = require('mongoose');
const { authorSummary } = require('../utils/serializers');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    body: {
      type: String,
      required: [true, 'Comment body is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        if (ret.author && typeof ret.author === 'object' && ret.author.username) {
          ret.author = authorSummary(ret.author);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Comment', commentSchema);
