/**
 * start.js – Development launcher for VT Parking Finder
 * ---------------------------------------------------
 * Orchestrates the local development stack by
 *  1. Detecting an installed Python 3 interpreter (cross‑platform)
 *  2. Creating / re‑using a virtual environment under ./backend/venv
 *  3. Installing backend (Flask) and frontend (React) dependencies as needed
 *  4. Spawning the Flask backend and React dev server, with smart log coloring
 *
 * Supported OSes: macOS, Linux, Windows 10/11
 * Node.js ≥ 14  (uses child_process.spawn with {shell:true})
 *
 * Author: VT Parking Finder Team
 * Last updated: 2025‑04‑21
 */

// ────────────────────────────────────────────────────────────────────────────
//  Imports & Constants
// ────────────────────────────────────────────────────────────────────────────

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs   = require('fs');
const os   = require('os');

/** ANSI color codes for readable terminal output */
const colors = {
  reset   : '\x1b[0m',
  bright  : '\x1b[1m',
  red     : '\x1b[31m',
  green   : '\x1b[32m',
  yellow  : '\x1b[33m',
  blue    : '\x1b[34m',
  magenta : '\x1b[35m'
};

// ────────────────────────────────────────────────────────────────────────────
//  Helper – locate an available Python 3 interpreter on this machine
// ────────────────────────────────────────────────────────────────────────────
/**
 * Returns a command string suitable for `spawn` that launches Python 3.
 * Checks common executables in priority order:
 *   1. python   (many Linux distros)
 *   2. python3  (macOS & modern Linux)
 *   3. py -3    (Windows launcher)
 *
 * @throws {Error} if no working interpreter is found.
 * @returns {string} Command that invokes Python 3 (may include a space, e.g. "py -3")
 */
function findSystemPython () {
  const candidates = [
    { cmd: 'python',  args: ['--version'] },
    { cmd: 'python3', args: ['--version'] },
    { cmd: 'py',      args: ['-3', '--version'] }
  ];

  for (const { cmd, args } of candidates) {
    const result = spawnSync(cmd, args, { stdio: 'ignore', shell: true });
    if (result.status === 0) return cmd === 'py' ? 'py -3' : cmd;
  }

  throw new Error('Python 3 not found – please install it and ensure it is on your PATH.');
}

// ────────────────────────────────────────────────────────────────────────────
//  Adds a banner
// ────────────────────────────────────────────────────────────────────────────
console.log(`${colors.bright}${colors.blue}=== VT Parking Finder ====${colors.reset}`);
console.log(`${colors.green}Preparing development environment...\n${colors.reset}`);

// ────────────────────────────────────────────────────────────────────────────
//  Path resolution
// ────────────────────────────────────────────────────────────────────────────
const backendDir  = path.join(__dirname, 'backend');
const frontendDir = __dirname;

if (!fs.existsSync(backendDir)) {
  console.error(`${colors.red}Error: backend directory not found at ${backendDir}${colors.reset}`);
  console.error(`${colors.yellow}Run this script from the project root.${colors.reset}`);
  process.exit(1);
}

const isWindows  = os.platform() === 'win32';
const venvPath   = path.join(backendDir, 'venv');
const venvBinDir = path.join(venvPath, isWindows ? 'Scripts' : 'bin');
const venvExists = fs.existsSync(venvBinDir);

// Paths *inside* the virtual environment (filled after creation)
const pythonExecutable = path.join(venvBinDir, isWindows ? 'python.exe' : 'python');
const pipExecutable    = path.join(venvBinDir, isWindows ? 'pip.exe'    : 'pip');

// ────────────────────────────────────────────────────────────────────────────
//  Utility – spawn a command and pipe stdio to parent
// ────────────────────────────────────────────────────────────────────────────
/**
 * Spawns a child process and returns a Promise that resolves on exit 0.
 * Rejects on any non‑zero exit code or spawn error.
 */
function runCommand (command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`${colors.yellow}Running: ${command} ${args.join(' ')}${colors.reset}`);

    const proc = spawn(command, args, {
      stdio : 'inherit', // pipe I/O directly to our console
      shell : true,      // enables Windows built‑ins like "py -3"
      ...options
    });

    proc.on('close', code => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
    proc.on('error', reject);
  });
}

// ────────────────────────────────────────────────────────────────────────────
//  Python environment setup
// ────────────────────────────────────────────────────────────────────────────
const PY_DEPS = [
  'flask',
  'flask-cors',
  'psycopg2-binary',
  'pyserial',
  'mysql-connector-python',
  'pyjwt'
];

/** Install/upgrade required Python packages inside the venv */
async function installPythonDependencies () {
  await runCommand(pipExecutable, ['install', ...PY_DEPS], { cwd: backendDir });
  console.log(`${colors.green}Python dependencies installed.${colors.reset}`);
}

/** Ensure virtualenv exists + up‑to‑date dependencies */
async function setupPythonEnvironment () {
  if (!venvExists) {
    console.log(`${colors.yellow}Creating Python virtual environment...${colors.reset}`);
    const systemPython = findSystemPython();
    await runCommand(systemPython, ['-m', 'venv', venvPath], { cwd: backendDir });
  } else {
    console.log(`${colors.green}Python virtual environment found.${colors.reset}`);
  }

  await installPythonDependencies();
}

// ────────────────────────────────────────────────────────────────────────────
//  Node/React dependency check
// ────────────────────────────────────────────────────────────────────────────
/**
 * Installs Node packages only if node_modules/react‑scripts is missing.
 * Keeps subsequent runs fast.
 */
async function checkFrontendDependencies () {
  const nodeModules      = path.join(frontendDir, 'node_modules');
  const reactScripts     = path.join(nodeModules, '.bin', isWindows ? 'react-scripts.cmd' : 'react-scripts');

  if (!fs.existsSync(nodeModules) || !fs.existsSync(reactScripts)) {
    console.log(`${colors.yellow}Installing frontend dependencies...${colors.reset}`);
    await runCommand('npm', ['install'], { cwd: frontendDir });
    await runCommand('npm', ['install',
      'axios',
      '@react-google-maps/api',
      'concurrently',
      'jsonwebtoken'
    ], { cwd: frontendDir });
    console.log(`${colors.green}Frontend dependencies installed.${colors.reset}`);
  } else {
    console.log(`${colors.green}Frontend dependencies are up‑to‑date.${colors.reset}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
//  Main – start both servers
// ────────────────────────────────────────────────────────────────────────────
async function startServers () {
  try {
    // 1. Python backend setup
    await setupPythonEnvironment();

    // 2. Node frontend setup
    await checkFrontendDependencies();

    // 3. Launch Flask backend
    console.log(`${colors.magenta}Starting Flask backend server...${colors.reset}`);
    const backendProc = spawn(pythonExecutable, ['server.py'], { cwd: backendDir, shell: true });

    // Pretty‑print backend stdout
    backendProc.stdout.on('data', d =>
      console.log(`${colors.blue}[Backend] ${colors.reset}${d.toString().trim()}`)
    );

    // Classify stderr messages for readability
    backendProc.stderr.on('data', data => {
      const msg = data.toString().trim();
      const http = msg.match(/HTTP\/\d\.\d"\s(\d{3})/);
      const code = http ? Number(http[1]) : null;

      // Assign color based on HTTP status or heuristics
      if (code !== null) {
        const palette = code < 400 ? colors.green
                      : code < 500 ? colors.yellow
                      : /* 500+ */    colors.red;
        console.log(`${palette}[Backend HTTP ${code}] ${colors.reset}${msg}`);
      } else if (msg.includes('DeprecationWarning')) {
        console.warn(`${colors.yellow}[Deprecation] ${colors.reset}${msg}`);
      } else {
        console.error(`${colors.red}[Backend] ${msg}${colors.reset}`);
      }
    });

    // 4. Launch React dev server after a short delay
    setTimeout(() => {
      console.log(`${colors.magenta}Starting React frontend server...${colors.reset}`);
      const frontProc = spawn('npm', ['start'], { cwd: frontendDir, stdio: 'inherit', shell: true });

      // Gracefully shut down both servers on Ctrl‑C
      const shutdown = () => {
        console.log(`\n${colors.yellow}Shutting down servers...${colors.reset}`);
        frontProc.kill();
        backendProc.kill();
        process.exit(0);
      };
      process.on('SIGINT',  shutdown);
      process.on('SIGTERM', shutdown);
    }, 3000);

    console.log(`${colors.green}Servers starting! Access at:${colors.reset}`);
    console.log(`${colors.green}→ Frontend: http://localhost:3000${colors.reset}`);
    console.log(`${colors.green}→ Backend : http://localhost:5000${colors.reset}`);

  } catch (err) {
    console.error(`${colors.red}Fatal: ${err.message}${colors.reset}`);
    process.exit(1);
  }
}

startServers();
