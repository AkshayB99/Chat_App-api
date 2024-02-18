const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
  {
    members: {
      type: Array,
    },
  },
  {
    timestamps: true,
  }
);

const ChatModel = mongoose.model('Chat', chatSchema);
module.exports = ChatModel;