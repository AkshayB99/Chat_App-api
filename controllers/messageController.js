const MessageModel = require('./../models/messageModel');
const catchAsync = require('./../utils/catchAsync');

exports.addMessage = catchAsync(async (req, res, next) => {
  const { chatId, senderId, text } = req.body;
  const message = new MessageModel({
    chatId,
    senderId,
    text,
  });

  const result = await message.save();
  res.status(200).json(result);
});

exports.getMessages = catchAsync(async (req, res) => {
  const result = await MessageModel.find({ chatId: req.params.chatId });
  res.status(200).json(result);
});
