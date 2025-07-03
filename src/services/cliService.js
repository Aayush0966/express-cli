const ExpressGenerator = require('../generators/expressGenerator');
const { showBanner, showSuccess, showError } = require('../display/banner');
const inquirer = require('inquirer');
const validatePackageName = require('validate-npm-package-name');

class CLIService {
  /**
   * Run the CLI with optional project name
   */
  static async run(projectName) {
    try {
      showBanner();

      // If no project name provided, prompt for it
      if (!projectName || !projectName.trim()) {
        const nameAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: 'What is your project name?',
            validate: (input) => {
              const validation = CLIService.validateProjectName(input.trim());
              return validation.isValid ? true : validation.error;
            }
          }
        ]);
        projectName = nameAnswer.projectName.trim();
      } else {
        // Validate provided project name
        const validName = this.validateProjectName(projectName.trim());
        
        if (!validName.isValid) {
          showError(validName.error);
          process.exit(1);
        }
        projectName = projectName.trim();
      }

      // Ask user for configuration options
      const config = await this.promptForConfiguration();

      // Generate Express project with configuration
      const generator = new ExpressGenerator(projectName, config);
      await generator.generate();

      showSuccess(projectName, config);
      
      // Ask if user wants to install dependencies
      await this.promptForNpmInstall(projectName);
      
    } catch (error) {
      showError(`Failed to generate project: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Prompt user for configuration options
   */
  static async promptForConfiguration() {
    console.log('Please answer the following questions to configure your Express.js project:\n');

    const questions = [
      {
        type: 'list',
        name: 'language',
        message: 'Would you like to use TypeScript?',
        choices: [
          { name: 'No (JavaScript)', value: 'javascript' },
          { name: 'Yes (TypeScript)', value: 'typescript' }
        ],
        default: 'javascript'
      },
      {
        type: 'list',
        name: 'authentication',
        message: 'Would you like to include authentication?',
        choices: [
          { name: 'No', value: 'none' },
          { name: 'JWT Authentication', value: 'jwt' },
          { name: 'Session-based Authentication', value: 'session' }
        ],
        default: 'jwt'
      },
      {
        type: 'list',
        name: 'database',
        message: 'Which database would you like to use?',
        choices: [
          { name: 'None', value: 'none' },
          { name: 'MongoDB with Mongoose', value: 'mongodb' },
          { name: 'PostgreSQL with Sequelize', value: 'postgresql' },
          { name: 'MySQL with Sequelize', value: 'mysql' },
          { name: 'SQLite with Sequelize', value: 'sqlite' }
        ],
        default: 'mongodb'
      },
      {
        type: 'confirm',
        name: 'docker',
        message: 'Would you like to include Docker configuration?',
        default: false
      }
    ];

    const answers = await inquirer.prompt(questions);
    
    // Automatically enable CORS and validation
    answers.cors = true;
    answers.validation = true;
    answers.testing = false; // Don't include testing setup
    
    console.log('\n📋 Configuration Summary:');
    console.log(`   Language: ${answers.language === 'typescript' ? 'TypeScript' : 'JavaScript'}`);
    console.log(`   Authentication: ${answers.authentication === 'none' ? 'None' : answers.authentication.toUpperCase()}`);
    console.log(`   Database: ${answers.database === 'none' ? 'None' : answers.database.toUpperCase()}`);
    console.log(`   CORS: Enabled (automatic)`);
    console.log(`   Validation: Enabled (automatic)`);
    console.log(`   Docker: ${answers.docker ? 'Enabled' : 'Disabled'}`);
    console.log('');

    return answers;
  }

  /**
   * Validate project name
   */
  static validateProjectName(name) {
    // Check if name is empty
    if (!name || name.length === 0) {
      return { isValid: false, error: 'Project name cannot be empty' };
    }

    // Use npm package name validation
    const validation = validatePackageName(name);
    if (!validation.validForNewPackages) {
      const errors = validation.errors || validation.warnings || [];
      return { 
        isValid: false, 
        error: `Invalid project name: ${errors.join(', ')}` 
      };
    }

    // Check length
    if (name.length > 50) {
      return { 
        isValid: false, 
        error: 'Project name must be 50 characters or less' 
      };
    }

    return { isValid: true };
  }

  /**
   * Prompt user to install npm dependencies
   */
  static async promptForNpmInstall(projectName) {
    console.log('\n');
    const installAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'installDependencies',
        message: 'Would you like to install npm dependencies now?',
        default: true
      }
    ]);

    if (installAnswer.installDependencies) {
      const chalk = require('chalk');
      const { spawn } = require('child_process');
      const path = require('path');
      
      console.log(chalk.cyan('\n📦 Installing dependencies...\n'));
      
      const projectPath = path.join(process.cwd(), projectName);
      
      return new Promise((resolve, reject) => {
        const npmInstall = spawn('npm', ['install'], {
          cwd: projectPath,
          stdio: 'inherit',
          shell: true
        });

        npmInstall.on('close', (code) => {
          if (code === 0) {
            console.log(chalk.green('\n✅ Dependencies installed successfully!'));
            console.log(chalk.cyan('\nNext steps:'));
            console.log(chalk.white(`  cd ${projectName}`));
            console.log(chalk.white(`  npm run dev`));
            console.log(chalk.white(`\n🚀 Your Express server will be running on http://localhost:3000\n`));
          } else {
            console.log(chalk.yellow('\n⚠️  Dependencies installation failed. You can install them manually by running:'));
            console.log(chalk.white(`  cd ${projectName}`));
            console.log(chalk.white(`  npm install\n`));
          }
          resolve();
        });

        npmInstall.on('error', (error) => {
          console.log(chalk.yellow('\n⚠️  Dependencies installation failed. You can install them manually by running:'));
          console.log(chalk.white(`  cd ${projectName}`));
          console.log(chalk.white(`  npm install\n`));
          resolve();
        });
      });
    } else {
      const chalk = require('chalk');
      console.log(chalk.cyan('\nNext steps:'));
      console.log(chalk.white(`  cd ${projectName}`));
      console.log(chalk.white(`  npm install`));
      console.log(chalk.white(`  npm run dev`));
      console.log(chalk.white(`\n🚀 Your Express server will be running on http://localhost:3000\n`));
    }
  }

  /**
   * Show help information
   */
  static showHelp() {
    showBanner();
    console.log(`
Usage: 
  npm start                    Interactive mode - prompts for project name
  express-gen <project-name>   Direct mode - generates with specified name

Examples:
  npm start                    # Interactive mode
  express-gen my-api-server
  express-gen user-management-system
  express-gen backend-service

Features:
  ✅ Interactive configuration prompts
  ✅ TypeScript or JavaScript support
  ✅ Multiple authentication options (JWT, Session)
  ✅ Multiple database options (MongoDB, PostgreSQL, MySQL, SQLite)
  ✅ Professional Express.js server structure
  ✅ Security middleware (Helmet, CORS, Rate Limiting)
  ✅ Input validation with express-validator (automatic)
  ✅ CORS enabled (automatic)
  ✅ Error handling middleware
  ✅ Professional logging
  ✅ Environment configuration
  ✅ Docker configuration (optional)

For more information, visit: https://github.com/your-repo/express-cli-generator
    `);
  }
}

module.exports = CLIService; 