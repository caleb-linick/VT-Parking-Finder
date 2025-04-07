/**
 * start.js
 * 
 * Starts both the React frontend and Flask backend servers.
 * Automatically sets up Python venv and installs dependencies if missing.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

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

// Determine directories
const backendDir = path.join(__dirname, 'backend');
const frontendDir = __dirname;

if (!fs.existsSync(backendDir)) {
  console.error(`${colors.red}Error: Backend directory not found at ${backendDir}${colors.reset}`);
  console.error(`${colors.yellow}Make sure you're running this script from the project root directory.${colors.reset}`);
  process.exit(1);
}

const isWindows = os.platform() === 'win32';
const venvPath = path.join(backendDir, 'venv');
const venvExists = fs.existsSync(path.join(venvPath, isWindows ? 'Scripts' : 'bin'));
const pythonExecutable = path.join(venvPath, isWindows ? 'Scripts' : 'bin', 'python');
const pipExecutable = path.join(venvPath, isWindows ? 'Scripts' : 'bin', 'pip');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.yellow}Running: ${command} ${args.join(' ')}${colors.reset}`);
    const proc = spawn(command, args, {
      ...options,
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function installPythonDependencies() {
  try {
    await runCommand(pipExecutable, [
      'install',
      'flask',
      'flask-cors',
      'psycopg2-binary',
      'pyserial',
      'mysql-connector-python'
    ], { cwd: backendDir });
    console.log(`${colors.green}Python dependencies installed.${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}Failed to install Python dependencies: ${err.message}${colors.reset}`);
    throw err;
  }
}

async function setupPythonEnvironment() {
  if (!venvExists) {
    console.log(`${colors.yellow}Creating Python virtual environment...${colors.reset}`);
    try {
      await runCommand('python', ['-m', 'venv', venvPath], { cwd: backendDir });
      await installPythonDependencies();
    } catch (error) {
      console.error(`${colors.red}Failed to setup Python environment: ${error.message}${colors.reset}`);
      process.exit(1);
    }
  } else {
    console.log(`${colors.green}Python virtual environment found.${colors.reset}`);
    await installPythonDependencies();
  }
}

async function checkFrontendDependencies() {
  const nodeModulesPath = path.join(frontendDir, 'node_modules');
  const reactScriptsPath = path.join(nodeModulesPath, '.bin', isWindows ? 'react-scripts.cmd' : 'react-scripts');

  if (!fs.existsSync(nodeModulesPath) || !fs.existsSync(reactScriptsPath)) {
    console.log(`${colors.yellow}Installing frontend dependencies...${colors.reset}`);
    try {
      await runCommand('npm', ['install'], { cwd: frontendDir });
      await runCommand('npm', ['install', 'axios', '@react-google-maps/api', 'concurrently'], { cwd: frontendDir });
      console.log(`${colors.green}Frontend dependencies installed.${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Failed to install frontend dependencies: ${error.message}${colors.reset}`);
      throw error;
    }
  } else {
    console.log(`${colors.green}Frontend dependencies are up-to-date.${colors.reset}`);
  }
}

async function startServers() {
  try {
    await setupPythonEnvironment();
    await checkFrontendDependencies();

    console.log(`${colors.magenta}Starting Flask backend server...${colors.reset}`);
    console.log(`Launching backend with: ${pythonExecutable} server.py in ${backendDir}`);

    const backendProcess = spawn(pythonExecutable, ['server.py'], {
      cwd: backendDir,
      shell: true
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`${colors.blue}[Backend] ${colors.reset}${data.toString().trim()}`);
    });

    backendProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
    
      const httpMatch = message.match(/HTTP\/\d\.\d"\s(\d{3})/);
      const statusCode = httpMatch ? parseInt(httpMatch[1], 10) : null;
    
      const isInfo = [
        'WARNING: This is a development server',
        'Running on',
        'Press CTRL+C to quit',
        'Debugger',
        'Restarting with stat'
      ].some(line => message.includes(line));
    
      if (statusCode !== null) {
        if (statusCode >= 200 && statusCode < 300) {
          console.log(`${colors.green}[Backend Success] ${colors.reset}${message}`);
        } else if (statusCode >= 300 && statusCode < 400) {
          console.log(`${colors.yellow}[Backend Redirect] ${colors.reset}${message}`);
        } else if (statusCode >= 400 && statusCode < 500) {
          console.warn(`${colors.yellow}[Backend Client Error] ${colors.reset}${message}`);
        } else if (statusCode >= 500) {
          console.error(`${colors.red}[Backend Server Error] ${colors.reset}${message}`);
        } else {
          console.log(`${colors.blue}[Backend HTTP] ${colors.reset}${message}`);
        }
      } else if (isInfo) {
        console.log(`${colors.yellow}[Backend Info] ${colors.reset}${message}`);
      } else if (message.includes('DeprecationWarning')) {
        console.warn(`${colors.yellow}[Deprecation Warning] ${colors.reset}${message}`);
      } else if (message.includes('webpack')) {
        console.log(`${colors.green}[Webpack] ${colors.reset}${message}`);
      } else {
        console.error(`${colors.red}[Backend Error] ${colors.reset}${message}`);
      }
    });
    

    setTimeout(() => {
      console.log(`${colors.magenta}Starting React frontend server...${colors.reset}`);
      const frontendProcess = spawn('npm', ['start'], {
        cwd: frontendDir,
        stdio: 'inherit',
        shell: true
      });

      const cleanup = () => {
        console.log(`\n${colors.yellow}Shutting down servers...${colors.reset}`);
        frontendProcess.kill();
        backendProcess.kill();
        process.exit(0);
      };

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

startServers();
