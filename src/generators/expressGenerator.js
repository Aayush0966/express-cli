const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const fse = require('fs-extra');

class ExpressGenerator {
  constructor(projectName, config = {}) {
    this.projectName = projectName;
    this.projectPath = path.join(process.cwd(), projectName);
    this.config = {
      language: 'javascript',
      authentication: 'jwt',
      database: 'mongodb',
      cors: true,
      validation: true,
      testing: true,
      docker: false,
      ...config
    };
  }

  async generate() {
    const spinner = ora(chalk.cyan('Generating Express server...')).start();

    try {
      this.createProjectStructure();
      this.createConfigFiles();
      this.createSourceFiles();
      
      if (this.config.docker) {
        this.createDockerFiles();
      }
      
      spinner.succeed(chalk.green('Express server generated successfully!'));
      return true;
    } catch (error) {
      spinner.fail(chalk.red('Failed to generate Express server'));
      throw error;
    }
  }

  createProjectStructure() {
    const directories = [
      '',
      'src',
      'src/controllers',
      'src/middleware',
      'src/models',
      'src/routes',
      'src/services',
      'src/utils',
      'src/config',
      'src/dtos'
    ];

    if (this.config.testing) {
      directories.push('tests', 'tests/unit', 'tests/integration');
    }

    if (this.config.language === 'typescript') {
      directories.push('dist', 'src/types');
    }

    directories.forEach(dir => {
      const dirPath = path.join(this.projectPath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  createConfigFiles() {
    const files = [
      'package.json',
      '.env.example',
      '.gitignore',
      'README.md'
    ];

    // Add language-specific files
    if (this.config.language === 'typescript') {
      files.push('tsconfig.json');
      files.push('src/types/index.ts');
    }

    // Add Jest config if testing is enabled
    if (this.config.testing) {
      files.push('jest.config.js');
    }

    // Create files with content
    files.forEach(filename => {
      const content = this.getFileContent(filename);
      fse.writeFileSync(path.join(this.projectPath, filename), content);
    });

    // Create server file separately with proper content
    const serverExt = this.config.language === 'typescript' ? 'ts' : 'js';
    const serverContent = this.getServerContent();
    fse.writeFileSync(path.join(this.projectPath, `server.${serverExt}`), serverContent);
  }

  createSourceFiles() {
    const ext = this.config.language === 'typescript' ? 'ts' : 'js';
    
    const sourceFiles = [
      `src/app.${ext}`,
      `src/config/environment.${ext}`,
      `src/dtos/apiResponse.${ext}`
    ];

    // Database configuration
    if (this.config.database !== 'none') {
      sourceFiles.push(`src/config/database.${ext}`);
    }

    // Authentication middleware
    if (this.config.authentication !== 'none') {
      sourceFiles.push(`src/middleware/auth.${ext}`);
    }

    // Error handler
    sourceFiles.push(`src/middleware/errorHandler.${ext}`);

    // Routes
    sourceFiles.push(`src/routes/index.${ext}`);
    sourceFiles.push(`src/routes/userRoutes.${ext}`);

    // Controllers and services
    sourceFiles.push(`src/controllers/userController.${ext}`);
    sourceFiles.push(`src/services/userService.${ext}`);

    // Models (based on database choice)
    if (this.config.database !== 'none') {
      sourceFiles.push(`src/models/User.${ext}`);
    }

    // Utilities
    sourceFiles.push(`src/utils/helpers.${ext}`);
    sourceFiles.push(`src/utils/constants.${ext}`);

    // Testing files
    if (this.config.testing) {
      sourceFiles.push(`tests/unit/user.test.${ext}`);
      sourceFiles.push(`tests/integration/api.test.${ext}`);
    }

    // Create files with content for essential files, empty for others
    sourceFiles.forEach(filename => {
      const content = this.getSourceFileContent(filename);
      fse.writeFileSync(path.join(this.projectPath, filename), content);
    });
  }

  createDockerFiles() {
    const dockerFiles = [
      'Dockerfile',
      'docker-compose.yml',
      '.dockerignore'
    ];

    dockerFiles.forEach(filename => {
      fse.writeFileSync(path.join(this.projectPath, filename), '');
    });
  }

  getFileContent(filename) {
    switch (filename) {
      case 'package.json':
        return this.getPackageJsonContent();
      case '.env.example':
        return this.getEnvExampleContent();
      case '.gitignore':
        return this.getGitignoreContent();
      case 'README.md':
        return this.getReadmeContent();
      case 'tsconfig.json':
        return this.getTsConfigContent();
      case 'jest.config.js':
        return this.getJestConfigContent();
      default:
        return '';
    }
  }

  getSourceFileContent(filename) {
    const ext = this.config.language === 'typescript' ? 'ts' : 'js';
    
    switch (filename) {
      case `src/app.${ext}`:
        return this.getAppContent();
      case `src/utils/helpers.${ext}`:
        return this.getHelpersContent();
      case `src/utils/constants.${ext}`:
        return this.getConstantsContent();
      case `src/middleware/errorHandler.${ext}`:
        return this.getErrorHandlerContent();
      case `src/dtos/apiResponse.${ext}`:
        return this.getApiResponseDtoContent();
      default:
        return '';
    }
  }

  getPackageJsonContent() {
    const dependencies = {
      express: "^4.18.2",
      dotenv: "^16.3.1",
      cors: "^2.8.5",
      helmet: "^7.1.0",
      morgan: "^1.10.0"
    };

    const devDependencies = {
      nodemon: "^3.0.2"
    };

    const scripts = {
      start: this.config.language === 'typescript' ? "node dist/server.js" : "node server.js",
      dev: this.config.language === 'typescript' ? "nodemon --exec npx tsx server.ts" : "nodemon server.js"
    };

    if (this.config.language === 'typescript') {
      devDependencies['typescript'] = "^5.3.2";
      devDependencies['tsx'] = "^4.6.2";
      devDependencies['@types/node'] = "^20.8.0";
      devDependencies['@types/express'] = "^4.17.20";
      devDependencies['@types/cors'] = "^2.8.15";
      devDependencies['@types/morgan'] = "^1.9.9";
      
      scripts.build = "tsc";
      scripts['build:watch'] = "tsc -w";
    }

    return JSON.stringify({
      name: this.projectName,
      version: "1.0.0",
      description: "Professional Express.js server",
      type: "module",
      main: this.config.language === 'typescript' ? "dist/server.js" : "server.js",
      scripts,
      keywords: ["express", "nodejs", "api", "server"],
      author: "",
      license: "MIT",
      dependencies,
      devDependencies
    }, null, 2);
  }

  getEnvExampleContent() {
    return `PORT=3000
NODE_ENV=development
API_VERSION=v1`;
  }

  getGitignoreContent() {
    return `node_modules/
.env
.env.local
.env.production
*.log
.DS_Store
dist/
coverage/`;
  }

  getReadmeContent() {
    return `# ${this.projectName}

Professional Express.js server with modern architecture.

## Features
- 🚀 Express.js with TypeScript support
- 🛡️ Security middleware (Helmet, CORS)
- 📝 Request logging with Morgan
- ✅ Professional project structure

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## API Endpoints
- \`GET /\` - Health check
- \`GET /api/v1/status\` - API status

## Available Scripts
- \`npm run dev\` - Start development server
- \`npm start\` - Start production server
- \`npm run build\` - Build for production (TypeScript only)`;
  }

  getTsConfigContent() {
    return JSON.stringify({
      "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "lib": ["ES2020"],
        "outDir": "./dist",
        "rootDir": "./",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "typeRoots": ["./node_modules/@types", "./src/types"],
        "baseUrl": ".",
        "paths": {
          "@/*": ["src/*"]
        }
      },
      "include": [
        "src/**/*",
        "server.ts"
      ],
      "exclude": [
        "node_modules",
        "dist",
        "tests"
      ]
    }, null, 2);
  }

  getJestConfigContent() {
    const isTS = this.config.language === 'typescript';
    
    if (isTS) {
      return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};`;
    }
    
    return `module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};`;
  }

  getServerContent() {
    if (this.config.language === 'typescript') {
      return `import dotenv from 'dotenv';
import app from '@/app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Graceful shutdown handling
const server = app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📱 Environment: \${NODE_ENV}\`);
  console.log(\`🔗 URL: http://localhost:\${PORT}\`);
  console.log(\`⏰ Started at: \${new Date().toISOString()}\`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\\n🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\\n🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});`;
    }
    
    return `import dotenv from 'dotenv';
import app from '@/app';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Graceful shutdown handling
const server = app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📱 Environment: \${NODE_ENV}\`);
  console.log(\`🔗 URL: http://localhost:\${PORT}\`);
  console.log(\`⏰ Started at: \${new Date().toISOString()}\`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\\n🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\\n🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});`;
  }

  getAppContent() {
    if (this.config.language === 'typescript') {
      return `import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { notFound, errorHandler } from '@/middleware/errorHandler';
import { successResponse } from '@/utils/helpers';
import { HTTP_STATUS } from '@/utils/constants';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json(successResponse('Server is running!'));
});

// API routes
app.get('/api/v1/status', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json(successResponse('API is healthy', {
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development'
  }));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;`;
    }
    
    return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { notFound, errorHandler } from '@/middleware/errorHandler';
import { successResponse } from '@/utils/helpers';
import { HTTP_STATUS } from '@/utils/constants';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json(successResponse('Server is running!'));
});

// API routes
app.get('/api/v1/status', (req, res) => {
  res.status(HTTP_STATUS.OK).json(successResponse('API is healthy', {
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development'
  }));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;`;
  }

  getHelpersContent() {
    if (this.config.language === 'typescript') {
      return `import { SuccessResponse, ErrorResponse } from '@/dtos/apiResponse';

/**
 * Creates a standardized success response
 */
export const successResponse = <T = any>(message: string, data?: T, path?: string): SuccessResponse<T> => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
  path
});

/**
 * Creates a standardized error response
 */
export const errorResponse = (message: string, errors?: any, path?: string): ErrorResponse => ({
  success: false,
  message,
  errors,
  timestamp: new Date().toISOString(),
  path
});

/**
 * Generates a random string of specified length
 */
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Formats date to ISO string
 */
export const formatDate = (date: Date = new Date()): string => {
  return date.toISOString();
};

/**
 * Capitalizes first letter of string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncates string to specified length
 */
export const truncate = (str: string, length: number): string => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};`;
    }
    
    return `import { SuccessResponse, ErrorResponse } from '@/dtos/apiResponse';

/**
 * Creates a standardized success response
 */
const successResponse = (message, data = null, path = null) => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
  path
});

/**
 * Creates a standardized error response
 */
const errorResponse = (message, errors = null, path = null) => ({
  success: false,
  message,
  errors,
  timestamp: new Date().toISOString(),
  path
});

/**
 * Generates a random string of specified length
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validates email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Formats date to ISO string
 */
const formatDate = (date = new Date()) => {
  return date.toISOString();
};

/**
 * Capitalizes first letter of string
 */
const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncates string to specified length
 */
const truncate = (str, length) => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};

export {
  successResponse,
  errorResponse,
  generateRandomString,
  isValidEmail,
  formatDate,
  capitalize,
  truncate
};`;
  }

  getConstantsContent() {
    if (this.config.language === 'typescript') {
      return `export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
} as const;

export const API_MESSAGES = {
  SUCCESS: {
    SERVER_RUNNING: 'Server is running!',
    API_HEALTHY: 'API is healthy',
    RESOURCE_CREATED: 'Resource created successfully',
    RESOURCE_UPDATED: 'Resource updated successfully',
    RESOURCE_DELETED: 'Resource deleted successfully',
    RESOURCE_RETRIEVED: 'Resource retrieved successfully'
  },
  ERROR: {
    ROUTE_NOT_FOUND: 'Route not found',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_FAILED: 'Validation failed',
    RESOURCE_NOT_FOUND: 'Resource not found',
    DUPLICATE_ENTRY: 'Duplicate entry found',
    INVALID_TOKEN: 'Invalid or expired token',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded'
  }
} as const;`;
    }
    
    return `export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

export const API_MESSAGES = {
  SUCCESS: {
    SERVER_RUNNING: 'Server is running!',
    API_HEALTHY: 'API is healthy',
    RESOURCE_CREATED: 'Resource created successfully',
    RESOURCE_UPDATED: 'Resource updated successfully',
    RESOURCE_DELETED: 'Resource deleted successfully',
    RESOURCE_RETRIEVED: 'Resource retrieved successfully'
  },
  ERROR: {
    ROUTE_NOT_FOUND: 'Route not found',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_FAILED: 'Validation failed',
    RESOURCE_NOT_FOUND: 'Resource not found',
    DUPLICATE_ENTRY: 'Duplicate entry found',
    INVALID_TOKEN: 'Invalid or expired token',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded'
  }
};`;
  }

  getErrorHandlerContent() {
    if (this.config.language === 'typescript') {
      return `import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@/utils/helpers';
import { HTTP_STATUS, API_MESSAGES } from '@/utils/constants';

/**
 * 404 Not Found middleware
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(\`\${API_MESSAGES.ERROR.ROUTE_NOT_FOUND} - \${req.originalUrl}\`);
  res.status(HTTP_STATUS.NOT_FOUND);
  next(error);
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = res.statusCode === 200 ? HTTP_STATUS.INTERNAL_SERVER_ERROR : res.statusCode;
  let message = err.message;

  // Handle specific error types
  if (err.name === 'CastError' && (err as any).kind === 'ObjectId') {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message = API_MESSAGES.ERROR.RESOURCE_NOT_FOUND;
  }

  if ((err as any).code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = API_MESSAGES.ERROR.DUPLICATE_ENTRY;
  }

  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = API_MESSAGES.ERROR.VALIDATION_FAILED;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = API_MESSAGES.ERROR.INVALID_TOKEN;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = API_MESSAGES.ERROR.INVALID_TOKEN;
  }

  // Create error response
  const response = errorResponse(message, err.stack, req.originalUrl);
  
  // Don't expose stack trace in production
  if (process.env.NODE_ENV === 'production') {
    delete response.errors;
  }

  res.status(statusCode).json(response);
};`;
  }

    return `import { errorResponse } from '@/utils/helpers';
import { HTTP_STATUS, API_MESSAGES } from '@/utils/constants';

/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  const error = new Error(\`\${API_MESSAGES.ERROR.ROUTE_NOT_FOUND} - \${req.originalUrl}\`);
  res.status(HTTP_STATUS.NOT_FOUND);
  next(error);
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? HTTP_STATUS.INTERNAL_SERVER_ERROR : res.statusCode;
  let message = err.message;

  // Handle specific error types
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message = API_MESSAGES.ERROR.RESOURCE_NOT_FOUND;
  }

  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = API_MESSAGES.ERROR.DUPLICATE_ENTRY;
  }

  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = API_MESSAGES.ERROR.VALIDATION_FAILED;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = API_MESSAGES.ERROR.INVALID_TOKEN;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = API_MESSAGES.ERROR.INVALID_TOKEN;
  }

  // Create error response
  const response = errorResponse(message, err.stack, req.originalUrl);
  // Don't expose stack trace in production
  if (process.env.NODE_ENV === 'production') {
    delete response.errors;
  }

  res.status(statusCode).json(response);
};

export {
  notFound,
  errorHandler
};`;
  }

  getApiResponseDtoContent() {
    if (this.config.language === 'typescript') {
      return `/**
 * Base API Response interface
 * Defines the standard structure for all API responses
 */
export interface ApiResponse<T = any> {
  /** Indicates if the request was successful */
  success: boolean;
  /** Human-readable message describing the response */
  message: string;
  /** Optional data payload */
  data?: T;
  /** Optional error details */
  errors?: any;
  /** ISO timestamp of when the response was generated */
  timestamp: string;
  /** Optional request path for debugging */
  path?: string;
}

/**
 * Success Response interface
 * Used for successful API responses with optional data
 */
export interface SuccessResponse<T = any> extends ApiResponse<T> {
  success: true;
  data?: T;
}

/**
 * Error Response interface
 * Used for error API responses with optional error details
 */
export interface ErrorResponse extends ApiResponse {
  success: false;
  errors?: any;
}

/**
 * Pagination metadata interface
 * Used for paginated responses
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there's a next page */
  hasNext: boolean;
  /** Whether there's a previous page */
  hasPrev: boolean;
}

/**
 * Paginated Response interface
 * Used for responses that include pagination metadata
 */
export interface PaginatedResponse<T = any> extends SuccessResponse<T[]> {
  data: T[];
  pagination: PaginationMeta;
}`;
    }
    
    return `/**
 * Base API Response structure
 * Defines the standard structure for all API responses
 */

/**
 * Success Response structure
 * Used for successful API responses with optional data
 * @param {string} message - Human-readable message
 * @param {any} data - Optional data payload
 * @param {string} path - Optional request path
 * @returns {Object} Success response object
 */
export const createSuccessResponse = (message, data = null, path = null) => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
  path
});

/**
 * Error Response structure
 * Used for error API responses with optional error details
 * @param {string} message - Error message
 * @param {any} errors - Optional error details
 * @param {string} path - Optional request path
 * @returns {Object} Error response object
 */
export const createErrorResponse = (message, errors = null, path = null) => ({
  success: false,
  message,
  errors,
  timestamp: new Date().toISOString(),
  path
});

/**
 * Pagination metadata structure
 * Used for paginated responses
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination metadata object
 */
export const createPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

/**
 * Paginated Response structure
 * Used for responses that include pagination metadata
 * @param {string} message - Success message
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination metadata
 * @param {string} path - Optional request path
 * @returns {Object} Paginated response object
 */
export const createPaginatedResponse = (message, data, pagination, path = null) => ({
  success: true,
  message,
  data,
  pagination,
  timestamp: new Date().toISOString(),
  path
});`;
  }
}

module.exports = ExpressGenerator; 