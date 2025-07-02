# Express CLI Generator

A professional CLI tool for generating Express.js servers with best practices and modern architecture.

## Features

🚀 **Professional Express.js Structure** - Clean, scalable architecture  
🛡️ **Security First** - Helmet, CORS, Rate Limiting built-in  
📝 **Request Logging** - Morgan logger configured  
🔐 **JWT Authentication** - Ready-to-use auth middleware  
📊 **MongoDB Integration** - Mongoose setup with best practices  
✅ **Input Validation** - Express-validator configured  
🎯 **Error Handling** - Comprehensive error middleware  
🧪 **Testing Ready** - Jest setup included  
🔄 **Development Tools** - Nodemon for hot reloading  

## Installation

### Global Installation (Recommended)

```bash
npm install -g express-cli-generator
```

### Local Usage

```bash
npx express-cli-generator <project-name>
```

### From Source

```bash
git clone <repository-url>
cd cli-tool
npm install
node bin/cli.js <project-name>
```

## Usage

### Generate a new Express server

```bash
express-gen my-api-server
```

### Examples

```bash
# E-commerce API
express-gen ecommerce-api

# User management system
express-gen user-management

# Blog backend
express-gen blog-backend
```

## Generated Project Structure

```
your-project/
├── src/
│   ├── config/
│   │   ├── database.js       # MongoDB configuration
│   │   └── environment.js    # Environment settings
│   ├── controllers/
│   │   └── userController.js # User CRUD operations
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   └── errorHandler.js  # Error handling
│   ├── models/
│   │   └── User.js          # User model with Mongoose
│   ├── routes/
│   │   ├── index.js         # Route aggregation
│   │   └── userRoutes.js    # User routes with validation
│   ├── services/
│   │   └── userService.js   # Business logic layer
│   ├── utils/
│   │   ├── constants.js     # Application constants
│   │   └── helpers.js       # Utility functions
│   └── app.js              # Express app configuration
├── .env.example            # Environment variables template
├── .gitignore             # Git ignore file
├── package.json           # Dependencies and scripts
├── README.md              # Project documentation
└── server.js              # Application entry point
```

## Generated Features

### API Endpoints

- `GET /` - Health check
- `GET /api/v1/health` - API health status
- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create new user
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Prevent injection attacks
- **Password Hashing** - Bcrypt integration

### Development Features

- **Hot Reloading** - Nodemon configuration
- **Environment Variables** - Dotenv setup
- **Professional Logging** - Morgan with custom formats
- **Error Handling** - Centralized error management

## Getting Started with Generated Project

1. **Navigate to your project:**
   ```bash
   cd your-project-name
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Test the API:**
   ```bash
   curl http://localhost:3000
   ```

## Environment Variables

```bash
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/your-project
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
API_VERSION=v1
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests with Jest

## Requirements

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/your-repo/express-cli-generator/issues). 