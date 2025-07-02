const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');

class ExpressGenerator {
  constructor(projectName) {
    this.projectName = projectName;
    this.projectPath = path.join(process.cwd(), projectName);
  }

  async generate() {
    const spinner = ora(chalk.cyan('Generating Express server...')).start();

    try {
      this.createProjectStructure();
      this.createConfigFiles();
      this.createSourceFiles();
      
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
      'README.md': this.getReadmeContent(),
      'server.js': this.getServerContent()
    };

    Object.entries(files).forEach(([filename, content]) => {
      fs.writeFileSync(path.join(this.projectPath, filename), content);
    });
  }

  createSourceFiles() {
    const sourceFiles = {
      'src/app.js': this.getAppContent(),
      'src/config/database.js': this.getDatabaseConfigContent(),
      'src/config/environment.js': this.getEnvironmentConfigContent(),
      'src/middleware/auth.js': this.getAuthMiddlewareContent(),
      'src/middleware/errorHandler.js': this.getErrorHandlerContent(),
      'src/controllers/userController.js': this.getUserControllerContent(),
      'src/models/User.js': this.getUserModelContent(),
      'src/routes/index.js': this.getIndexRoutesContent(),
      'src/routes/userRoutes.js': this.getUserRoutesContent(),
      'src/services/userService.js': this.getUserServiceContent(),
      'src/utils/helpers.js': this.getHelpersContent(),
      'src/utils/constants.js': this.getConstantsContent()
    };

    Object.entries(sourceFiles).forEach(([filename, content]) => {
      fs.writeFileSync(path.join(this.projectPath, filename), content);
    });
  }

  getPackageJsonContent() {
    return JSON.stringify({
      name: this.projectName,
      version: "1.0.0",
      description: "Professional Express.js server",
      main: "server.js",
      scripts: {
        start: "node server.js",
        dev: "nodemon server.js",
        test: "jest"
      },
      keywords: ["express", "nodejs", "api", "server"],
      author: "",
      license: "MIT",
      dependencies: {
        express: "^4.18.2",
        cors: "^2.8.5",
        helmet: "^7.1.0",
        morgan: "^1.10.0",
        "express-rate-limit": "^7.1.5",
        bcryptjs: "^2.4.3",
        jsonwebtoken: "^9.0.2",
        mongoose: "^8.0.3",
        dotenv: "^16.3.1",
        "express-validator": "^7.0.1"
      },
      devDependencies: {
        nodemon: "^3.0.2",
        jest: "^29.7.0"
      }
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
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
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

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = { authenticate };`;
  }

  getErrorHandlerContent() {
    return `const notFound = (req, res, next) => {
  const error = new Error(\`Not Found - \${req.originalUrl}\`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };`;
  }

  getUserControllerContent() {
    return `const { validationResult } = require('express-validator');
const UserService = require('../services/userService');

const getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await UserService.createUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserService.updateUser(id, req.body);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UserService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
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

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
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
}

module.exports = ExpressGenerator; 