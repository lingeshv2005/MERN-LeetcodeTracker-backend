import DailyProblem from '../models/DailyProblem.js';

export const getActiveDailyCodingChallenge = async (req, res) => {
  try {
    const dailyProblem = await DailyProblem.findOne(); 
    console.log(dailyProblem);
    if (!dailyProblem) {
      return res.status(404).json({ message: 'No daily problem found' });
    }
    res.status(200).json(dailyProblem);
  } catch (error) {
    console.error('Error fetching daily problem:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
