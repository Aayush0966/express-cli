const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

class TemplateService {
  constructor() {
    this.templatesPath = path.join(__dirname, '..', 'templates');
    this.registerHelpers();
  }

  registerHelpers() {
    // Register custom Handlebars helpers
    Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });

    Handlebars.registerHelper('or', function() {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    });

    Handlebars.registerHelper('and', function() {
      return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
    });
  }

  /**
   * Render a template with the given context
   * @param {string} templatePath - Path to template relative to templates directory
   * @param {object} context - Data to pass to the template
   * @returns {string} Rendered template content
   */
  render(templatePath, context = {}) {
    const fullTemplatePath = path.join(this.templatesPath, templatePath);
    
    if (!fs.existsSync(fullTemplatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const templateContent = fs.readFileSync(fullTemplatePath, 'utf8');
    const template = Handlebars.compile(templateContent);
    
    return template(context);
  }

  /**
   * Get template context from configuration
   * @param {string} projectName 
   * @param {object} config 
   * @returns {object} Context object for templates
   */
  getContext(projectName, config) {
    return {
      projectName,
      language: config.language,
      typescript: config.language === 'typescript',
      javascript: config.language === 'javascript',
      cors: config.cors,
      validation: config.validation,
      testing: config.testing,
      docker: config.docker,
      
      // Authentication
      authJwt: config.authentication === 'jwt',
      authSession: config.authentication === 'session',
      authNone: config.authentication === 'none',
      
      // Database
      mongodb: config.database === 'mongodb',
      postgresql: config.database === 'postgresql',
      mysql: config.database === 'mysql',
      sqlite: config.database === 'sqlite',
      database: config.database !== 'none',
      
      // Helper for file extensions
      ext: config.language === 'typescript' ? 'ts' : 'js'
    };
  }

  /**
   * Get all template files for a given configuration
   * @param {object} config 
   * @returns {Array} Array of template file objects
   */
  getTemplateFiles(config) {
    const isTypescript = config.language === 'typescript';
    const ext = isTypescript ? 'ts' : 'js';
    
    const templates = [
      // Base files
      { source: 'base/package.json.hbs', target: 'package.json' },
      { source: 'base/env.example.hbs', target: '.env.example' },
      { source: 'base/.gitignore', target: '.gitignore' },
      { source: 'base/README.md.hbs', target: 'README.md' },
      
      // Server files
      { 
        source: isTypescript ? 'typescript/server.hbs' : 'javascript/server.hbs', 
        target: isTypescript ? 'server.ts' : 'server.js' 
      },
      
      // App files
      { 
        source: isTypescript ? 'typescript/src/app.hbs' : 'javascript/src/app.hbs', 
        target: `src/app.${ext}` 
      },
      
      // Config files
      { 
        source: isTypescript ? 'typescript/src/config/environment.hbs' : 'javascript/src/config/environment.hbs', 
        target: `src/config/environment.${ext}` 
      },
      
      // Middleware
      { 
        source: isTypescript ? 'typescript/src/middleware/errorHandler.hbs' : 'javascript/src/middleware/errorHandler.hbs', 
        target: `src/middleware/errorHandler.${ext}` 
      },
      
      // Routes
      { 
        source: isTypescript ? 'typescript/src/routes/index.hbs' : 'javascript/src/routes/index.hbs', 
        target: `src/routes/index.${ext}` 
      },
      
      // User routes
      { 
        source: isTypescript ? 'typescript/src/routes/userRoutes.hbs' : 'javascript/src/routes/userRoutes.hbs', 
        target: `src/routes/userRoutes.${ext}` 
      },
      
      // Controllers
      { 
        source: isTypescript ? 'typescript/src/controllers/userController.hbs' : 'javascript/src/controllers/userController.hbs', 
        target: `src/controllers/userController.${ext}` 
      },
      
      // Services
      { 
        source: isTypescript ? 'typescript/src/services/userService.hbs' : 'javascript/src/services/userService.hbs', 
        target: `src/services/userService.${ext}` 
      },
      
      // Utils
      { 
        source: isTypescript ? 'typescript/src/utils/helpers.hbs' : 'javascript/src/utils/helpers.hbs', 
        target: `src/utils/helpers.${ext}` 
      },
      { 
        source: isTypescript ? 'typescript/src/utils/constants.hbs' : 'javascript/src/utils/constants.hbs', 
        target: `src/utils/constants.${ext}` 
      }
    ];

    // Add authentication middleware if needed
    if (config.authentication !== 'none') {
      templates.push({
        source: isTypescript ? 'typescript/src/middleware/auth.hbs' : 'javascript/src/middleware/auth.hbs',
        target: `src/middleware/auth.${ext}`
      });
    }

    // Add database models if needed
    if (config.database !== 'none') {
      templates.push({
        source: isTypescript ? 'typescript/src/models/User.hbs' : 'javascript/src/models/User.hbs',
        target: `src/models/User.${ext}`
      });
    }

    // Add database config if needed
    if (config.database !== 'none') {
      templates.push({
        source: isTypescript ? 'typescript/src/config/database.hbs' : 'javascript/src/config/database.hbs',
        target: `src/config/database.${ext}`
      });
    }

    // Add TypeScript specific files
    if (isTypescript) {
      templates.push(
        { source: 'typescript/tsconfig.json', target: 'tsconfig.json' },
        { source: 'typescript/src/types/index.hbs', target: 'src/types/index.ts' }
      );
    }

    // Add Jest config if testing is enabled
    if (config.testing) {
      templates.push({ source: 'base/jest.config.js', target: 'jest.config.js' });
    }

    // Add Docker files if enabled
    if (config.docker) {
      templates.push(
        { source: 'base/Dockerfile', target: 'Dockerfile' },
        { source: 'base/docker-compose.yml', target: 'docker-compose.yml' },
        { source: 'base/.dockerignore', target: '.dockerignore' }
      );
    }

    return templates;
  }
}

module.exports = TemplateService; 