// models/Problem.js
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    inputFormat: { type: String, required: true },
    outputFormat: { type: String, required: true },
    constraints: { type: String, required: true },
    testCases: [{ input: String, output: String }],
    expectedTime: Number,
    rating:Number
});

module.exports = mongoose.model('Problem', problemSchema);
