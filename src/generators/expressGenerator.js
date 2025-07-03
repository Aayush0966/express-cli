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
      'src/config'
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
    const files = {
      'package.json': this.getPackageJsonContent(),
      '.env.example': this.getEnvExampleContent(),
      '.gitignore': this.getGitignoreContent(),
      'README.md': this.getReadmeContent()
    };

    // Add language-specific files
    if (this.config.language === 'typescript') {
      files['tsconfig.json'] = this.getTsConfigContent();
      files['src/types/index.ts'] = this.getTypesContent();
    }

    // Add server file
    const serverExt = this.config.language === 'typescript' ? 'ts' : 'js';
    files[`server.${serverExt}`] = this.getServerContent();

    // Add Jest config if testing is enabled
    if (this.config.testing) {
      files['jest.config.js'] = this.getJestConfigContent();
    }

    Object.entries(files).forEach(([filename, content]) => {
      fse.writeFileSync(path.join(this.projectPath, filename), content);
    });
  }

  createSourceFiles() {
    const ext = this.config.language === 'typescript' ? 'ts' : 'js';
    
    const sourceFiles = {
      [`src/app.${ext}`]: this.getAppContent(),
      [`src/config/environment.${ext}`]: this.getEnvironmentConfigContent()
    };

    // Database configuration
    if (this.config.database !== 'none') {
      sourceFiles[`src/config/database.${ext}`] = this.getDatabaseConfigContent();
    }

    // Authentication middleware
    if (this.config.authentication !== 'none') {
      sourceFiles[`src/middleware/auth.${ext}`] = this.getAuthMiddlewareContent();
    }

    // Error handler
    sourceFiles[`src/middleware/errorHandler.${ext}`] = this.getErrorHandlerContent();

    // Routes
    sourceFiles[`src/routes/index.${ext}`] = this.getIndexRoutesContent();
    sourceFiles[`src/routes/userRoutes.${ext}`] = this.getUserRoutesContent();

    // Controllers and services
    sourceFiles[`src/controllers/userController.${ext}`] = this.getUserControllerContent();
    sourceFiles[`src/services/userService.${ext}`] = this.getUserServiceContent();

    // Models (based on database choice)
    if (this.config.database !== 'none') {
      sourceFiles[`src/models/User.${ext}`] = this.getUserModelContent();
    }

    // Utilities
    sourceFiles[`src/utils/helpers.${ext}`] = this.getHelpersContent();
    sourceFiles[`src/utils/constants.${ext}`] = this.getConstantsContent();

    // Testing files
    if (this.config.testing) {
      sourceFiles[`tests/unit/user.test.${ext}`] = this.getUserTestContent();
      sourceFiles[`tests/integration/api.test.${ext}`] = this.getApiTestContent();
    }

    Object.entries(sourceFiles).forEach(([filename, content]) => {
      fse.writeFileSync(path.join(this.projectPath, filename), content);
    });
  }

  getPackageJsonContent() {
    const dependencies = {
      express: "^4.18.2",
      dotenv: "^16.3.1"
    };

    const devDependencies = {
      nodemon: "^3.0.2"
    };

    const scripts = {
      start: this.config.language === 'typescript' ? "node dist/server.js" : "node server.js",
      dev: this.config.language === 'typescript' ? "nodemon --exec ts-node server.ts" : "nodemon server.js"
    };

    // Add TypeScript dependencies
    if (this.config.language === 'typescript') {
      devDependencies['typescript'] = "^5.3.2";
      devDependencies['ts-node'] = "^10.9.1";
      devDependencies['@types/node'] = "^20.8.0";
      devDependencies['@types/express'] = "^4.17.20";
      
      scripts.build = "tsc";
      scripts['build:watch'] = "tsc -w";
    }

    // Add CORS
    if (this.config.cors) {
      dependencies.cors = "^2.8.5";
      if (this.config.language === 'typescript') {
        devDependencies['@types/cors'] = "^2.8.15";
      }
    }

    // Add security middleware
    dependencies.helmet = "^7.1.0";
    dependencies.morgan = "^1.10.0";
    dependencies["express-rate-limit"] = "^7.1.5";

    // Add authentication dependencies
    if (this.config.authentication === 'jwt') {
      dependencies.bcryptjs = "^2.4.3";
      dependencies.jsonwebtoken = "^9.0.2";
      if (this.config.language === 'typescript') {
        devDependencies['@types/bcryptjs'] = "^2.4.5";
        devDependencies['@types/jsonwebtoken'] = "^9.0.5";
      }
    } else if (this.config.authentication === 'session') {
      dependencies['express-session'] = "^1.17.3";
      dependencies['connect-mongo'] = "^5.1.0";
      dependencies.bcryptjs = "^2.4.3";
      if (this.config.language === 'typescript') {
        devDependencies['@types/express-session'] = "^1.17.10";
        devDependencies['@types/bcryptjs'] = "^2.4.5";
      }
    }

    // Add database dependencies
    switch (this.config.database) {
      case 'mongodb':
        dependencies.mongoose = "^8.0.3";
        break;
      case 'postgresql':
        dependencies.sequelize = "^6.35.0";
        dependencies.pg = "^8.11.3";
        if (this.config.language === 'typescript') {
          devDependencies['@types/pg'] = "^8.10.7";
        }
        break;
      case 'mysql':
        dependencies.sequelize = "^6.35.0";
        dependencies.mysql2 = "^3.6.5";
        break;
      case 'sqlite':
        dependencies.sequelize = "^6.35.0";
        dependencies.sqlite3 = "^5.1.6";
        break;
    }

    // Add validation
    if (this.config.validation) {
      dependencies["express-validator"] = "^7.0.1";
    }

    // Add testing dependencies
    if (this.config.testing) {
      devDependencies.jest = "^29.7.0";
      devDependencies.supertest = "^6.3.3";
      
      if (this.config.language === 'typescript') {
        devDependencies['@types/jest'] = "^29.5.8";
        devDependencies['@types/supertest'] = "^2.0.16";
        devDependencies['ts-jest'] = "^29.1.1";
      }
      
      scripts.test = "jest";
      scripts['test:watch'] = "jest --watch";
      scripts['test:coverage'] = "jest --coverage";
    }

    return JSON.stringify({
      name: this.projectName,
      version: "1.0.0",
      description: "Professional Express.js server",
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
DATABASE_URL=mongodb://localhost:27017/${this.projectName}
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
API_VERSION=v1`;
  }

  getGitignoreContent() {
    return `node_modules/
.env
.env.local
.env.production
*.log
.DS_Store`;
  }

  getReadmeContent() {
    return `# ${this.projectName}

Professional Express.js server with best practices.

## Features
- 🚀 Express.js with modern architecture
- 🛡️ Security middleware (Helmet, CORS, Rate Limiting)
- 📝 Request logging with Morgan
- 🔐 JWT authentication setup
- 📊 MongoDB integration with Mongoose
- ✅ Input validation with express-validator

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
- \`GET /api/v1/users\` - Get all users
- \`POST /api/v1/users\` - Create user
- \`GET /api/v1/users/:id\` - Get user by ID
- \`PUT /api/v1/users/:id\` - Update user
- \`DELETE /api/v1/users/:id\` - Delete user`;
  }

  getServerContent() {
    return `require('dotenv').config();
const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');

const PORT = process.env.PORT || 3000;

connectDatabase();

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
  console.log(\`📱 Environment: \${process.env.NODE_ENV || 'development'}\`);
  console.log(\`🔗 URL: http://localhost:\${PORT}\`);
});`;
  }

  getAppContent() {
    return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { successResponse } = require('./utils/helpers');
const { HTTP_STATUS } = require('./utils/constants');

const app = express();

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json(successResponse('Server is running!'));
});

app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;`;
  }

  getDatabaseConfigContent() {
    return `const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(\`📊 MongoDB Connected: \${connection.connection.host}\`);
  } catch (error) {
    console.error(\`❌ Database connection error: \${error.message}\`);
    process.exit(1);
  }
};

module.exports = { connectDatabase };`;
  }

  getEnvironmentConfigContent() {
    return `const config = {
  development: {
    port: process.env.PORT || 3000,
    database: process.env.DATABASE_URL || 'mongodb://localhost:27017/${this.projectName}',
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    jwtExpire: process.env.JWT_EXPIRE || '7d'
  },
  production: {
    port: process.env.PORT || 3000,
    database: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d'
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];`;
  }

  getAuthMiddlewareContent() {
    return `const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/environment');
const { errorResponse } = require('../utils/helpers');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(errorResponse('Access denied. No token provided.'));
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json(errorResponse('Invalid token.'));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json(errorResponse('Invalid token.'));
  }
};

module.exports = { authenticate };`;
  }

  getErrorHandlerContent() {
    return `const { errorResponse } = require('../utils/helpers');
const { HTTP_STATUS } = require('../utils/constants');

const notFound = (req, res, next) => {
  const error = new Error(\`Not Found - \${req.originalUrl}\`);
  res.status(HTTP_STATUS.NOT_FOUND);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? HTTP_STATUS.INTERNAL_SERVER_ERROR : res.statusCode;
  let message = err.message;

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = HTTP_STATUS.NOT_FOUND;
    message = 'Resource not found';
  }

  if (err.code === 11000) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Duplicate field value entered';
  }

  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  const response = errorResponse(message);
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };`;
  }

  getUserControllerContent() {
    return `const { validationResult } = require('express-validator');
const UserService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/helpers');
const { HTTP_STATUS, MESSAGES } = require('../utils/constants');

const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(HTTP_STATUS.OK).json(successResponse('Users retrieved successfully', users));
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to retrieve users', error.message));
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse(MESSAGES.ERROR.USER_NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json(successResponse('User retrieved successfully', user));
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to retrieve user', error.message));
  }
};

const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(errorResponse(MESSAGES.ERROR.VALIDATION_FAILED, errors.array()));
    }

    const user = await UserService.createUser(req.body);
    res.status(HTTP_STATUS.CREATED).json(successResponse(MESSAGES.SUCCESS.USER_CREATED, user));
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to create user', error.message));
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.updateUser(id, req.body);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse(MESSAGES.ERROR.USER_NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json(successResponse(MESSAGES.SUCCESS.USER_UPDATED, user));
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to update user', error.message));
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserService.deleteUser(id);

    if (!deleted) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse(MESSAGES.ERROR.USER_NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json(successResponse(MESSAGES.SUCCESS.USER_DELETED));
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(errorResponse('Failed to delete user', error.message));
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};`;
  }

  getUserModelContent() {
    return `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);`;
  }

  getIndexRoutesContent() {
    return `const express = require('express');
const userRoutes = require('./userRoutes');
const { successResponse } = require('../utils/helpers');
const { HTTP_STATUS } = require('../utils/constants');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json(successResponse('API is healthy'));
});

router.use('/users', userRoutes);

module.exports = router;`;
  }

  getUserRoutesContent() {
    return `const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/userController');

const router = express.Router();

const createUserValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

const paramValidation = [
  param('id').isMongoId()
];

router.get('/', userController.getAllUsers);
router.get('/:id', paramValidation, userController.getUserById);
router.post('/', createUserValidation, userController.createUser);
router.put('/:id', paramValidation, userController.updateUser);
router.delete('/:id', paramValidation, userController.deleteUser);

module.exports = router;`;
  }

  getUserServiceContent() {
    return `const User = require('../models/User');

class UserService {
  static async getAllUsers() {
    return await User.find({ isActive: true }).select('-password');
  }

  static async getUserById(id) {
    return await User.findById(id).select('-password');
  }

  static async createUser(userData) {
    const user = new User(userData);
    await user.save();
    return await User.findById(user._id).select('-password');
  }

  static async updateUser(id, updateData) {
    return await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
  }

  static async deleteUser(id) {
    return await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }
}

module.exports = UserService;`;
  }

  getHelpersContent() {
    return `const successResponse = (message, data = null) => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

const errorResponse = (message, errors = null) => ({
  success: false,
  message,
  errors,
  timestamp: new Date().toISOString()
});

const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  successResponse,
  errorResponse,
  generateRandomString
};`;
  }

  getConstantsContent() {
    return `const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

const MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully'
  },
  ERROR: {
    USER_NOT_FOUND: 'User not found',
    UNAUTHORIZED: 'Unauthorized access',
    VALIDATION_FAILED: 'Validation failed'
  }
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  MESSAGES
};`;
  }

  // TypeScript configuration
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

  getTypesContent() {
    return `export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}`;
  }

  // Jest configuration
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

  // Docker files
  getDockerfileContent() {
    const isTS = this.config.language === 'typescript';
    
    return `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

${isTS ? `# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]` : `# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]`}`;
  }

  getDockerComposeContent() {
    const services = {
      app: {
        build: '.',
        ports: ['3000:3000'],
        environment: [
          'NODE_ENV=production'
        ],
        volumes: ['.env:/app/.env'],
        depends_on: []
      }
    };

    if (this.config.database === 'mongodb') {
      services.mongodb = {
        image: 'mongo:7',
        ports: ['27017:27017'],
        environment: [
          'MONGO_INITDB_ROOT_USERNAME=admin',
          'MONGO_INITDB_ROOT_PASSWORD=password'
        ],
        volumes: ['mongodb_data:/data/db']
      };
      services.app.depends_on.push('mongodb');
      services.app.environment.push(`DATABASE_URL=mongodb://admin:password@mongodb:27017/${this.projectName}?authSource=admin`);
    } else if (this.config.database === 'postgresql') {
      services.postgres = {
        image: 'postgres:15',
        ports: ['5432:5432'],
        environment: [
          'POSTGRES_DB=' + this.projectName,
          'POSTGRES_USER=admin',
          'POSTGRES_PASSWORD=password'
        ],
        volumes: ['postgres_data:/var/lib/postgresql/data']
      };
      services.app.depends_on.push('postgres');
      services.app.environment.push('DATABASE_URL=postgres://admin:password@postgres:5432/' + this.projectName);
    }

    const volumes = {};
    if (this.config.database === 'mongodb') {
      volumes.mongodb_data = {};
    } else if (this.config.database === 'postgresql') {
      volumes.postgres_data = {};
    }

    return `version: '3.8'

services:
${Object.entries(services).map(([name, config]) => 
  `  ${name}:
${Object.entries(config).map(([key, value]) => {
  if (Array.isArray(value)) {
    return `    ${key}:
${value.map(v => `      - ${v}`).join('\n')}`;
  } else if (typeof value === 'object') {
    return `    ${key}:
${Object.entries(value).map(([k, v]) => `      ${k}: ${v}`).join('\n')}`;
  }
  return `    ${key}: ${value}`;
}).join('\n')}`
).join('\n\n')}

${Object.keys(volumes).length > 0 ? `volumes:
${Object.entries(volumes).map(([name, config]) => `  ${name}:`).join('\n')}` : ''}`;
  }

  getDockerIgnoreContent() {
    return `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.docker
tests
*.test.js
*.test.ts`;
  }

  // Test files
  getUserTestContent() {
    const isTS = this.config.language === 'typescript';
    
    if (isTS) {
      return `import { UserService } from '../../src/services/userService';
import { User } from '../../src/types';

describe('UserService', () => {
  describe('validateUser', () => {
    it('should validate a valid user', () => {
      const user: Partial<User> = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const result = UserService.validateUser(user);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const user: Partial<User> = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };
      
      const result = UserService.validateUser(user);
      expect(result.isValid).toBe(false);
    });
  });
});`;
    }
    
    return `const UserService = require('../../src/services/userService');

describe('UserService', () => {
  describe('validateUser', () => {
    it('should validate a valid user', () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const result = UserService.validateUser(user);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid email', () => {
      const user = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };
      
      const result = UserService.validateUser(user);
      expect(result.isValid).toBe(false);
    });
  });
});`;
  }

  getApiTestContent() {
    const isTS = this.config.language === 'typescript';
    
    if (isTS) {
      return `import request from 'supertest';
import app from '../../src/app';

describe('API Routes', () => {
  describe('GET /', () => {
    it('should return health check', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body.message).toBe('Server is running!');
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return users list', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });
});`;
    }
    
    return `const request = require('supertest');
const app = require('../../src/app');

describe('API Routes', () => {
  describe('GET /', () => {
    it('should return health check', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
      
      expect(response.body.message).toBe('Server is running!');
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return users list', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });
});`;
  }

  createDockerFiles() {
    const dockerFiles = {
      'Dockerfile': this.getDockerfileContent(),
      'docker-compose.yml': this.getDockerComposeContent(),
      '.dockerignore': this.getDockerIgnoreContent()
    };

    Object.entries(dockerFiles).forEach(([filename, content]) => {
      fse.writeFileSync(path.join(this.projectPath, filename), content);
    });
  }
}

module.exports = ExpressGenerator; 