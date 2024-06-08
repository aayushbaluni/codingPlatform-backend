const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const Problem = require('../models/Problem'); // Import the Problem model

// Get the directory of the current script
const scriptDirectory = __dirname;

// Function to execute code based on language
async function executeCode(sourceCode, language, plainProblem) {
    try {
        if (!plainProblem) {
            throw new Error('Problem not found');
        }

        const problem = new Problem(plainProblem);

        // Execute each test case concurrently and gather the results
        const results = await Promise.all(problem.testCases.map(async (testCase) => {
            const input = testCase.input;
            const expectedOutput = testCase.output;
            let verdict = 'Pending';
            let executionTime = null;

            switch (language) {
                case 'cpp':
                    try {
                        const cppResult = await compileAndExecuteCPP(sourceCode, input, expectedOutput);
                        verdict = cppResult.verdict;
                        executionTime = cppResult.executionTime;
                    } catch (error) {
                        verdict = 'Error';
                    }
                    break;
                case 'python':
                    try {
                        const pythonResult = await executePython(sourceCode, input, expectedOutput);
                        verdict = pythonResult.verdict;
                        executionTime = pythonResult.executionTime;
                    } catch (error) {
                        verdict = 'Error';
                    }
                    break;
                default:
                    throw new Error(`Language '${language}' is not supported.`);
            }

            return {
                input,
                expectedOutput,
                verdict,
                executionTime
            };
        }));

        // Check if all test cases are accepted
        const allAccepted = results.every(result => result.verdict === 'Accepted');
        console.log(results)
        if (allAccepted) {
            // If all test cases are accepted, return the maximum execution time
            let maxExecutionTime = -1;
            let maxTimeResult = null;
            results.forEach((result) => {
                if (result.executionTime > maxExecutionTime) {
                    maxExecutionTime = result.executionTime;
                    maxTimeResult = result;
                }
            });
            return maxTimeResult;
        } else {
            const firstWrong = results.find(result => result.verdict !== 'Accepted');
            return firstWrong;
        }
    } catch (error) {
        throw new Error(`Error executing code: ${error.message}`);
    }
}

async function compileAndExecuteCPP(sourceCode, input, expectedOutput) {
    return new Promise((resolve, reject) => {
        const tempFilePath = path.join(scriptDirectory, 'temp.cpp');
        const inputFile = path.join(scriptDirectory, 'input.txt');
        const outputFile = path.join(scriptDirectory, 'output.txt');
        // Write the source code to a temporary file
        fs.writeFile(tempFilePath, sourceCode, async (err) => {
            if (err) {
                reject(new Error(`Error writing file: ${err.message}`));
                return;
            }

            // Write input data to input file
            fs.writeFile(inputFile, input, async (err) => {
                if (err) {
                    reject(new Error(`Error writing input file: ${err.message}`));
                    return;
                }

                // Compile the C++ code
                execFile('g++', [tempFilePath, '-o', path.join(scriptDirectory, 'output')], async (err, stdout, stderr) => {
                    if (err) {
                        reject(new Error(`Compilation Error: ${stderr}`));
                        return;
                    }
                    // Execute the compiled C++ code
                    execFile(path.join(scriptDirectory, 'output'), { input: fs.createReadStream(inputFile) }, async (err, stdout, stderr) => {
                        if (err) {
                            reject(new Error(`Runtime Error: ${stderr}`));
                            return;
                        }
                        // Write output to output file
                        fs.writeFile(outputFile, stdout, 'utf8', (err) => {
                            if (err) {
                                reject(new Error(`Error writing output file: ${err.message}`));
                                return;
                            }

                            // Read output from output file
                            fs.readFile(outputFile, 'utf8', (err, data) => {
                                if (err) {
                                    reject(new Error(`Error reading output file: ${err.message}`));
                                    return;
                                }

                                const trimmedData = data.trim();
                                const trimmedExpectedOutput = expectedOutput.trim();
                                const verdict = trimmedData === trimmedExpectedOutput ? 'Accepted' : 'Wrong Answer';
                                resolve({ verdict, executionTime: 0 }); // Assuming execution time is 0 for simplicity
                            });
                        });
                    });
                });
            });
        });
    });
}


// Function to execute Python code
async function executePython(sourceCode, input, expectedOutput) {
    return new Promise((resolve, reject) => {
        const tempFilePath = path.join(scriptDirectory, 'temp.py');
        const inputFile = path.join(scriptDirectory, 'input.txt');
        const outputFile = path.join(scriptDirectory, 'output.txt');
        // Write the source code to a temporary file
        fs.writeFile(tempFilePath, sourceCode, async (err) => {
            if (err) {
                reject(new Error(`Error writing file: ${err.message}`));
                return;
            }

            // Write input data to input file
            fs.writeFile(inputFile, input, async (err) => {
                if (err) {
                    reject(new Error(`Error writing input file: ${err.message}`));
                    return;
                }

                // Execute the Python code and redirect the output to a file
                execFile('python', [tempFilePath], { input: fs.createReadStream(inputFile), output: fs.createWriteStream(outputFile) }, async (err, stdout, stderr) => {
                    if (err) {
                        reject(new Error(`Runtime Error: ${stderr}`));
                        return;
                    }

                    // Read output from standard output
                    const trimmedData = stdout.trim();
                    const trimmedExpectedOutput = expectedOutput.trim();
                    const verdict = trimmedData === trimmedExpectedOutput ? 'Accepted' : 'Wrong Answer';

                    resolve({ verdict, executionTime: 0 }); // Assuming execution time is 0 for simplicity
                });
            });
        });
    });
}

module.exports = { executeCode };
