const ExpressGenerator = require('../generators/expressGenerator');
const { showBanner, showSuccess, showError } = require('../display/banner');

class CLIService {
  /**
   * Run the CLI with project name
   */
  static async run(projectName) {
    try {
      showBanner();

      if (!projectName || !projectName.trim()) {
        showError('Project name is required!');
        process.exit(1);
      }

      // Validate project name
      const validName = this.validateProjectName(projectName.trim());
      
      if (!validName.isValid) {
        showError(validName.error);
        process.exit(1);
      }

      // Generate Express project
      const generator = new ExpressGenerator(projectName.trim());
      await generator.generate();

      showSuccess(projectName.trim());
      
    } catch (error) {
      showError(`Failed to generate project: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Validate project name
   */
  static validateProjectName(name) {
    // Check if name is empty
    if (!name || name.length === 0) {
      return { isValid: false, error: 'Project name cannot be empty' };
    }

    // Check for valid characters (letters, numbers, hyphens, underscores)
    const validNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validNameRegex.test(name)) {
      return { 
        isValid: false, 
        error: 'Project name can only contain letters, numbers, hyphens, and underscores' 
      };
    }

    // Check if name starts with a letter
    if (!/^[a-zA-Z]/.test(name)) {
      return { 
        isValid: false, 
        error: 'Project name must start with a letter' 
      };
    }

    // Check length
    if (name.length > 50) {
      return { 
        isValid: false, 
        error: 'Project name must be 50 characters or less' 
      };
    }

    // Check for reserved names
    const reservedNames = ['node_modules', 'src', 'dist', 'build', 'test', 'tests'];
    if (reservedNames.includes(name.toLowerCase())) {
      return { 
        isValid: false, 
        error: `"${name}" is a reserved name. Please choose a different name.` 
      };
    }

    return { isValid: true };
  }

  /**
   * Show help information
   */
  static showHelp() {
    showBanner();
    console.log(`
Usage: express-gen <project-name>

Arguments:
  project-name    Name of the Express.js project to generate

Examples:
  express-gen my-api-server
  express-gen user-management-system
  express-gen backend-service

Features:
  ✅ Professional Express.js server structure
  ✅ Security middleware (Helmet, CORS, Rate Limiting)
  ✅ MongoDB integration with Mongoose
  ✅ JWT authentication setup
  ✅ Input validation with express-validator
  ✅ Error handling middleware
  ✅ Professional logging
  ✅ Environment configuration
  ✅ Ready-to-use User CRUD operations

For more information, visit: https://github.com/your-repo/express-cli-generator
    `);
  }
}

module.exports = CLIService; 