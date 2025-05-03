import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    threadId: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.pre("validate", function (next) {
  if (!this.threadId && this.sender && this.receiver) {
    const ids = [this.sender.toString(), this.receiver.toString()].sort();
    this.threadId = `${ids[0]}_${ids[1]}`;
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
