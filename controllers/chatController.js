const ChatModel = require('./../models/chatModel');
const catchAsync = require('./../utils/catchAsync');

exports.createChat = catchAsync(async (req, res) => {
  const newChat = new ChatModel({
    members: [req.body.senderId, req.body.receiverId],
  });
  const result = await newChat.save();
  res.status(200).json(result);
});

exports.userChats = catchAsync(async (req, res) => {
  const chat = await ChatModel.find({
    members: { $in: [req.params.userId] },
  });
  res.status(200).json(chat);
});

exports.findChat = catchAsync(async (req, res) => {
    const chat = await ChatModel.findOne({
    members: { $all: [req.params.firstId, req.params.secondId] },
  });
  res.status(200).json(chat);
})