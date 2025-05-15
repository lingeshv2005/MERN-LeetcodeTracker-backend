import UserData from '../models/UserData.js';
import User from "../models/User.js";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
  try {
    const { rollnumber, name, username, password, leetcode_username_url, email } = req.body;

    const existingUser = await UserData.findOne({ $or: [{ username }, { email }, { rollnumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with given username, email, or rollnumber.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // salt rounds = 10

    const newUser = new UserData({
      rollnumber,
      name,
      username,
      password: hashedPassword,
      leetcode_username_url,
      email
    });

    const userDetails = new User({
      allQuestionsCount: [],
      matchedUser: {
        username: username,
        languageProblemCount: [],
      },
      recentSubmissionList: [],
      userContestRanking: [],
      userContestRankingHistory: [],
      additionalDetails:{
        userId:uuidv4()
    },
      username:username
    });

    // Save userDetails to 'User' collection
    await userDetails.save();

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while registering user.' });
  }
};

const JWT_SECRET = 'your_secret_key_here'; // Ideally, store this in process.env.JWT_SECRET

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await UserData.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    const userDetails = await User.findOne({ username });
    res.status(200).json({ message: 'Login successful', token, userId: userDetails?.additionalDetails?.userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};
