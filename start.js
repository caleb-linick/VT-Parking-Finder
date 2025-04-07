/**
 * start.js
 * 
 * This script starts both the React frontend and Flask backend servers
 * simultaneously. It will create a Python virtual environment if one doesn't
 * exist and install required dependencies.
 * 
 * To use:
 * 1. Ensure Node.js and Python are installed
 * 2. Run the script: node start.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

console.log(`${colors.bright}${colors.blue}=== VT Parking Finder ====${colors.reset}`);
console.log(`${colors.green}Preparing development environment...\n${colors.reset}`);

// Determine the backend directory
const backendDir = path.join(__dirname, 'backend');

// Check if backend directory exists
if (!fs.existsSync(backendDir)) {
  console.error(`${colors.red}Error: Backend directory not found at ${backendDir}${colors.reset}`);
  console.error(`${colors.yellow}Make sure you're running this script from the project root directory.${colors.reset}`);
  process.exit(1);
}

// Determine if we're on Windows or Unix-like OS
const isWindows = os.platform() === 'win32';
const venvPath = path.join(backendDir, 'venv');
const pythonVenvActivate = isWindows ? 
  path.join(venvPath, 'Scripts', 'activate') :
  path.join(venvPath, 'bin', 'activate');

// Check if virtual environment exists
const venvExists = isWindows ? 
  fs.existsSync(path.join(venvPath, 'Scripts')) :
  fs.existsSync(path.join(venvPath, 'bin'));

// Function to run a command and return a promise
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.yellow}Running: ${command} ${args.join(' ')}${colors.reset}`);
    
    const process = spawn(command, args, { 
      ...options, 
      stdio: 'inherit',
      shell: true 
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      reject(err);
    });
  });
}

// Setup Python environment if needed
async function setupPythonEnvironment() {
  if (!venvExists) {
    console.log(`${colors.yellow}Creating Python virtual environment...${colors.reset}`);
    try {
      // Create virtual environment
      await runCommand('python', ['-m', 'venv', venvPath], { cwd: backendDir });
      
      console.log(`${colors.yellow}Installing Python dependencies...${colors.reset}`);
      await installPythonDependencies();
    } catch (error) {
      console.error(`${colors.red}Failed to setup Python environment: ${error.message}${colors.reset}`);
      console.error(`${colors.yellow}You may need to setup the virtual environment manually. See README.md for instructions.${colors.reset}`);
      process.exit(1);
    }
  } else {
    console.log(`${colors.green}Python virtual environment found.${colors.reset}`);
    // Ensure dependencies are installed
    await installPythonDependencies();
  }
}

// Install Python dependencies
async function installPythonDependencies() {
  try {
    const pipCommand = isWindows ? 
      `"${path.join(venvPath, 'Scripts', 'pip')}"` : 
      `"${path.join(venvPath, 'bin', 'pip')}"`;
    
    // Install all required packages
    await runCommand(pipCommand, [
      'install', 
      'flask', 
      'flask-cors',
      'psycopg2-binary', 
      'pyserial',
      'mysql-connector-python'  
    ], { cwd: backendDir });
    
    
    console.log(`${colors.green}Python dependencies installed.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to install Python dependencies: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Start servers
async function startServers() {
  try {
    // Setup Python environment if needed
    await setupPythonEnvironment();
    
    // Start backend server
    console.log(`${colors.magenta}Starting Flask backend server...${colors.reset}`);
    
    const pythonExecutable = isWindows ? 
      path.join(venvPath, 'Scripts', 'python') : 
      path.join(venvPath, 'bin', 'python');
    
      const backendCommand = isWindows
      ? `${pythonExecutable} ${path.join(backendDir, 'server.py')}`
      : `cd "${backendDir}" && "${pythonExecutable}" server.py`;
    
    const backendProcess = spawn(isWindows ? 'cmd.exe' : 'bash', [
      isWindows ? '/c' : '-c',
      backendCommand
    ], {
      stdio: 'pipe',
      shell: true
    });
    
    
    backendProcess.stdout.on('data', (data) => {
      console.log(`${colors.blue}[Backend] ${colors.reset}${data.toString().trim()}`);
    });
    
    backendProcess.stderr.on('data', (data) => {
      console.error(`${colors.red}[Backend Error] ${colors.reset}${data.toString().trim()}`);
    });
    
    // Give the backend a moment to start before launching frontend
    setTimeout(() => {
      // Start frontend server
      console.log(`${colors.magenta}Starting React frontend server...${colors.reset}`);
      
      const frontendProcess = spawn('npm', ['start'], {
        stdio: 'inherit',
        shell: true
      });
      
      // Handle process termination
      const cleanup = () => {
        console.log(`\n${colors.yellow}Shutting down servers...${colors.reset}`);
        frontendProcess.kill();
        backendProcess.kill();
        process.exit(0);
      };
      
      // Listen for termination signals
      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
    }, 3000);
    
    console.log(`${colors.green}Servers starting! You can access:${colors.reset}`);
    console.log(`${colors.green}- Frontend: http://localhost:3000${colors.reset}`);
    console.log(`${colors.green}- Backend: http://localhost:5000${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error starting servers: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Start the application
startServers();