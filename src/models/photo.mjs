import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  },
}, {
  collection: 'photos',
  minimize: false,
  versionKey: false
}).set('toJSON', {
  transform: (doc, ret) => {
    const retUpdated = ret;
    retUpdated.id = ret._id;

    delete retUpdated._id;

    return retUpdated;
  }
});

export default Schema;
