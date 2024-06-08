// controllers/problemController.js
const Problem = require('../models/Problem');

exports.createProblem = async (req, res) => {
    try {
        const problem = await Problem.create(req.body);
        res.status(201).json({ problem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProblems = async (req, res) => {
    try {
        const {expectedTime,userRating}=req.body;
        const problems=await findRandomProblemByCriteria(expectedTime,userRating);

        // const problems = await Problem.find();

        res.json({ problems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const findRandomProblemByCriteria=async(expectedTime, userRating=1200)=> {
    try {
        let query = {};
        if (expectedTime) {
            query.expectedTime = { $lte: expectedTime };
        }

        // Fetch all problems that match the expected time criteria
        const problems = await Problem.find(query).exec();
        if (problems.length === 0) {
            throw new Error('No problems found for the given criteria');
        }

        // Find the problem(s) with the closest rating to the user's rating
        let closestProblems = [];
        let closestRatingDiff = Infinity;

        problems.forEach(problem => {
            const ratingDiff = Math.abs(problem.rating - userRating);
            if (ratingDiff < closestRatingDiff) {
                closestRatingDiff = ratingDiff;
                closestProblems = [problem];
            } else if (ratingDiff === closestRatingDiff) {
                closestProblems.push(problem);
            }
        });

        // Select a random problem from the closest problems
        const randomProblem = closestProblems[Math.floor(Math.random() * closestProblems.length)];

        return randomProblem;
    } catch (error) {
        throw new Error(`Error querying problems: ${error.message}`);
    }
}


