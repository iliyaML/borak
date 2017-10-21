const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  message: {
    type: String,
    required: true
  },
  channel: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  }
});

mongoose.model('messages', MessageSchema);
