const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    sourceCode: { type: String, required: true },
    language: { type: String, required: true },
    verdict: {
        type: String,
        enum: ['Pending', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error', 'Error'],
        default: 'Pending'
    },
    executionTime: { type: Number },
    submittedAt: { type: Date, default: Date.now },
    output:{type:String}
});

module.exports = mongoose.model('Submission', submissionSchema);
