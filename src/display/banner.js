const chalk = require('chalk');
const figlet = require('figlet');

/**
 * Display the CLI banner with beautiful styling
 */
function showBanner() {
  console.clear();
  
  const banner = figlet.textSync('Express Gen', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  console.log(chalk.cyan(banner));
  console.log(chalk.gray('━'.repeat(80)));
  console.log(chalk.yellow.bold('  🚀 Professional Express.js Server Generator'));
  console.log(chalk.gray('  Generate production-ready Express servers with best practices'));
  console.log(chalk.gray('━'.repeat(80)));
  console.log();
}

/**
 * Display success message
 */
function showSuccess(projectName, config = {}) {
  console.log();
  console.log(chalk.green('━'.repeat(80)));
  console.log(chalk.green.bold('  ✅ SUCCESS! Your Express server has been generated'));
  console.log(chalk.gray('━'.repeat(80)));
  console.log(chalk.cyan(`  📂 Project: ${projectName}`));
  console.log(chalk.cyan(`  📍 Location: ./${projectName}`));
  
  if (config && Object.keys(config).length > 0) {
    console.log();
    console.log(chalk.yellow.bold('  📋 Configuration Applied:'));
    console.log(chalk.white(`    Language: ${config.language === 'typescript' ? 'TypeScript' : 'JavaScript'}`));
    console.log(chalk.white(`    Authentication: ${config.authentication === 'none' ? 'None' : config.authentication.toUpperCase()}`));
    console.log(chalk.white(`    Database: ${config.database === 'none' ? 'None' : config.database.toUpperCase()}`));
    console.log(chalk.white(`    CORS: ${config.cors ? 'Enabled' : 'Disabled'}`));
    console.log(chalk.white(`    Validation: ${config.validation ? 'Enabled' : 'Disabled'}`));
    console.log(chalk.white(`    Testing: ${config.testing ? 'Enabled' : 'Disabled'}`));
    console.log(chalk.white(`    Docker: ${config.docker ? 'Enabled' : 'Disabled'}`));
  }
  
  console.log();
  console.log(chalk.yellow.bold('  🏃‍♂️ Next Steps:'));
  console.log(chalk.white(`    cd ${projectName}`));
  console.log(chalk.white('    npm install'));
  if (config.language === 'typescript') {
    console.log(chalk.white('    npm run build'));
  }
  console.log(chalk.white('    npm run dev'));
  console.log();
  console.log(chalk.gray('━'.repeat(80)));
}

/**
 * Display error message
 */
function showError(message) {
  console.log();
  console.log(chalk.red('━'.repeat(80)));
  console.log(chalk.red.bold('  ❌ ERROR'));
  console.log(chalk.gray('━'.repeat(80)));
  console.log(chalk.red(`  ${message}`));
  console.log(chalk.gray('━'.repeat(80)));
}

module.exports = {
  showBanner,
  showSuccess,
  showError
}; 