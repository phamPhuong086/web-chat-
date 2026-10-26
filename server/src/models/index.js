/**
 * @file index.js
 * @description Tập trung export toàn bộ models của ứng dụng
 */

const User = require("./User");
const Room = require("./Room");
const FriendRequest = require("./FriendRequest");
const Message = require("./Message");

module.exports = {
  User,
  Room,
  FriendRequest,
  Message,
};
