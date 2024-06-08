// controllers/submissionController.js
const Submission = require('../models/Submission');
const { Worker } = require('worker_threads');
const path = require('path');
const Problems=require('../models/Problem');
exports.createSubmission = async (req, res) => {
    try {
        const userId = req.userId;
        const {problemId, sourceCode, language } = req.body;
        const submission = await Submission.create({ userId, problemId,language, sourceCode, verdict: 'Pending' });
        let problem=await Problems.findOne({_id:problemId});
        if(problem){
            problem=problem.toObject();
        }
        const worker = new Worker(path.resolve(__dirname, '../utils/worker.js'), {
            workerData: { sourceCode, language,problem:problem }
        });
        worker.on('message', async (message) => {
            if (message.error) {
                console.log(message.error);
                console.log(message.error);
                submission.verdict = 'Error';
                submission.executionTime = 0;
                submission.error = message.error;
            } else {
                submission.verdict = message?.verdict || 'Compilation Error';
                submission.executionTime = message.executionTime; // You can measure execution time if needed
                submission.output = message.output;
            }
            await submission.save();
            res.json({ submission });
        });

        worker.on('error', async (error) => {
            console.log(error);
            submission.verdict = 'Error';
            submission.executionTime = 0;
            submission.error = error.message;
            await submission.save();
            res.status(500).json({ error: error.message });
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

