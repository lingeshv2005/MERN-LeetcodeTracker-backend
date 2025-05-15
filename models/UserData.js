import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  rollnumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  leetcode_username_url: { type: String, required: true },
  email: { type: String, required: true, unique: true }
}, { timestamps: true });

export default mongoose.model('UserData', userSchema);
