#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showWelcome() {
  console.log(`
┌─────────────────────────────────────┐
│                                     │
│        🎉 Welcome to CLI Tool! 🎉   │
│                                     │
│   A simple command-line interface   │
│    with Express project generator   │
│                                     │
└─────────────────────────────────────┘

Hello! Thank you for using our CLI tool.

Options:
  1. Generate Express project
  2. Exit

Version: 1.0.0
`);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

function createFile(filePath, content = '') {
  fs.writeFileSync(filePath, content);
  console.log(`📄 Created file: ${filePath}`);
}

function generateExpressProject(projectName, useTypeScript) {
  const projectPath = path.join(process.cwd(), projectName);
  
  console.log(`\n🚀 Generating ${useTypeScript ? 'TypeScript' : 'JavaScript'} Express project: ${projectName}\n`);

  createDirectory(projectPath);

  const directories = [
    'src',
    'src/controllers',
    'src/middleware',
    'src/models',
    'src/routes',
    'src/services',
    'src/utils',
    'src/config',
    'src/types',
    'tests',
    'tests/unit',
    'tests/integration',
    'public',
    'public/css',
    'public/js',
    'public/images',
    'logs',
    'docs'
  ];

  directories.forEach(dir => {
    createDirectory(path.join(projectPath, dir));
  });

  const ext = useTypeScript ? 'ts' : 'js';
  const configExt = useTypeScript ? 'ts' : 'js';

  const files = {
    [`src/app.${ext}`]: '',
    [`src/server.${ext}`]: '',
    'src/controllers/index.js': '',
    'src/controllers/userController.js': '',
    'src/middleware/auth.js': '',
    'src/middleware/errorHandler.js': '',
    'src/middleware/logger.js': '',
    'src/models/index.js': '',
    'src/models/User.js': '',
    'src/routes/index.js': '',
    'src/routes/users.js': '',
    'src/routes/api.js': '',
    'src/services/userService.js': '',
    'src/services/emailService.js': '',
    'src/utils/helpers.js': '',
    'src/utils/constants.js': '',
    'src/config/database.js': '',
    'src/config/environment.js': '',
    'tests/unit/user.test.js': '',
    'tests/integration/api.test.js': '',
    'tests/setup.js': '',
    'public/css/styles.css': '',
    'public/js/main.js': '',
    'public/index.html': '',
    '.env.example': '',
    '.env': '',
    '.gitignore': '',
    'README.md': '',
    'package.json': '',
    'docker-compose.yml': '',
    'Dockerfile': '',
    '.dockerignore': '',
    'docs/API.md': '',
    'docs/SETUP.md': ''
  };

  if (useTypeScript) {
    files['tsconfig.json'] = '';
    files['src/types/index.ts'] = '';
    files['src/types/User.ts'] = '';
    files['src/types/Request.ts'] = '';
  }

  Object.keys(files).forEach(filePath => {
    createFile(path.join(projectPath, filePath), files[filePath]);
  });

  console.log(`\n✅ Express project '${projectName}' has been generated successfully!`);
  console.log(`📂 Project location: ${projectPath}`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${projectName}`);
  console.log(`  npm install`);
  console.log(`  npm start\n`);
}

async function main() {
  showWelcome();

  try {
    const choice = await askQuestion('What would you like to do? (1 or 2): ');

    if (choice === '1') {
      const projectName = await askQuestion('Enter project name: ');
      
      if (!projectName.trim()) {
        console.log('❌ Project name cannot be empty!');
        rl.close();
        return;
      }

      const langChoice = await askQuestion('Choose language (1 for JavaScript, 2 for TypeScript): ');
      const useTypeScript = langChoice === '2';

      generateExpressProject(projectName.trim(), useTypeScript);
    } else if (choice === '2') {
      console.log('👋 Goodbye!');
    } else {
      console.log('❌ Invalid choice. Please run the tool again.');
    }
  } catch (error) {
    console.error('❌ An error occurred:', error.message);
  } finally {
    rl.close();
  }
}

main(); 