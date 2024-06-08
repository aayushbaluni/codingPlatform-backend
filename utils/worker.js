// worker.js
const { parentPort, workerData } = require('worker_threads');
const { executeCode } = require('./codeExecutor'); // Assume this is your code execution logic

(async () => {
    try {
        const { submissionId, sourceCode, language, problem} = workerData;
        const result = await executeCode(sourceCode, language,problem);
        console.log(result);
        parentPort.postMessage({
            submissionId,
            verdict: result.verdict,
            executionTime: result.executionTime
        });
    } catch (error) {
        parentPort.postMessage({
            submissionId: workerData.submissionId,
            verdict: 'Error',
            executionTime: null,
            error: error.message
        });
    }
})();
