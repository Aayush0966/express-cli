#!/usr/bin/env node

const { program } = require('commander');
const CLIService = require('../src/services/cliService');

// Set up commander
program
  .name('express-gen')
  .description('Professional Express.js server generator')
  .version('1.0.0')
  .argument('[project-name]', 'name of the Express.js project to generate (optional - will prompt if not provided)')
  .action((projectName) => {
    CLIService.run(projectName);
  });

// Handle help command
program
  .command('help')
  .description('show help information')
  .action(() => {
    CLIService.showHelp();
  });

// Parse command line arguments
program.parse(process.argv); 