// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // Check if user with the same email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        // If not, proceed with user registration
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });
        res.status(201).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ error: 'Invalid password' });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getSolvedProblem = async (req, res) => {
    try {
        const userId = req.userId;
      if(userId){
          const user = await User.findById(userId).populate('solvedProblems');
          console.log(user);
          if (!user) {
              return res.status(404).json({ message: 'User not found' });
          }
          res.json(user.solvedProblems);
      } else {
          res.status(401).json({ error: 'User not found' });
      }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}