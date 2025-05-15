import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

export const getByUsername = async (req, res) => {
    try {
      const username = req.params.username;
      const user = await User.findOne({ "matchedUser.username": username });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user by username', error: error.message });
    }
  };
  
  export const getUserSearch = async (req, res) => {
    console.log('Searching for user:', req.params.q); // Log the query to see what's being sent
    
    try {
      const query = req.params.q;
  
      // Ensure query is defined
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
  
      // Perform the search query using $regex operator
      const users = await User.find({
        'matchedUser.username': { $regex: query, $options: 'i' }  // Case-insensitive search
      })
      .select('matchedUser.username')  // Only return the username field
      .limit(10);  // Limit the number of results to 10
    
      // If no users are found, return a 'User not found' message
      if (users.length === 0) {
        return res.json({ message: "User not found" });
      }
  
      // Format the results to only include the username
      const results = users.map(user => ({
        userId: user.matchedUser.username
      }));
  
      // Send the results as a response
      res.json(results);
    } catch (err) {
      console.error('User search failed:', err);
      res.status(500).json({ message: 'Error searching users.' });
    }
  };
  
  export const getUsernameByUserId = async (req, res) => {
    const { userId } = req.params;
  
    try {
      const user = await User.findOne({ 'additionalDetails.userId': userId }).select('username');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ username: user.username });
    } catch (error) {
      console.error('Error fetching username:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
    