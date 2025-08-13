# 🚗 Car Rental Management System API

A comprehensive car rental management system built with NestJS, featuring user management, car listings, rental operations, reviews, and administrative controls.

## 🌟 Features

- **User Management**: Customer registration, authentication, and profile management
- **Car Management**: Vehicle listings, availability, and owner management  
- **Rental System**: Booking, payment, and rental history tracking
- **Review System**: User ratings and feedback for cars and experiences
- **Admin Panel**: Comprehensive administrative controls and analytics
- **Ranking System**: Performance metrics and user ratings
- **JWT Authentication**: Secure role-based access control

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd car-rental-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=car_rental_db
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Bcrypt Configuration
   BCRYPT_ROUNDS=12
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb car_rental_db
   
   # Run migrations (if using TypeORM migrations)
   npm run migration:run
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run start:prod
   ```

## 📚 API Documentation

### Swagger UI

Once the application is running, you can access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

### Authentication

The API uses JWT (JSON Web Token) authentication. To access protected endpoints:

1. **Register or Login** to get a JWT token
2. **Include the token** in the Authorization header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### User Roles

- **CUSTOMER**: Can browse cars, make rentals, and leave reviews
- **OWNER**: Can list cars, manage availability, and view earnings
- **ADMIN**: Full system access, user management, and analytics

## 🔐 API Endpoints

### Authentication & Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/users` | Register new user | ❌ |
| `GET` | `/users` | Get all users | ✅ |
| `GET` | `/users/:id` | Get user by ID | ✅ |
| `PATCH` | `/users/:id` | Update user profile | ✅ |
| `DELETE` | `/users/:id` | Delete user account | ✅ |

### Cars

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/cars` | Create new car listing | ✅ (OWNER/ADMIN) |
| `GET` | `/cars` | Get all cars | ❌ |
| `GET` | `/cars/:id` | Get car by ID | ❌ |
| `PATCH` | `/cars/:id` | Update car listing | ✅ (OWNER/ADMIN) |
| `DELETE` | `/cars/:id` | Delete car listing | ✅ (OWNER/ADMIN) |

### Rentals

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/history` | Create new rental | ✅ (CUSTOMER) |
| `GET` | `/history` | Get rental history | ✅ |
| `GET` | `/history/:id` | Get rental by ID | ✅ |
| `PATCH` | `/history/:id` | Update rental | ✅ |
| `DELETE` | `/history/:id` | Cancel rental | ✅ |

### Reviews

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/reviews` | Create new review | ✅ (CUSTOMER) |
| `GET` | `/reviews` | Get all reviews | ❌ |
| `GET` | `/reviews/:id` | Get review by ID | ❌ |
| `PATCH` | `/reviews/:id` | Update review | ✅ |
| `DELETE` | `/reviews/:id` | Delete review | ✅ |

### Admin Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/admin` | Create admin account | ✅ (ADMIN) |
| `POST` | `/admin/login` | Admin login | ❌ |
| `GET` | `/admin/users` | Get all users | ✅ (ADMIN) |
| `GET` | `/admin/cars` | Get all cars | ✅ (ADMIN) |
| `GET` | `/admin/rentals` | Get all rentals | ✅ (ADMIN) |
| `GET` | `/admin/stats` | Get system statistics | ✅ (ADMIN) |

## 💡 Usage Examples

### 1. User Registration

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "password": "securePassword123",
    "role": "CUSTOMER",
    "address": "123 Main St, City, Country",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. User Login

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

### 3. Create Car Listing (Owner)

```bash
curl -X POST http://localhost:3000/cars \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "brand": "Toyota",
    "model": "Camry",
    "year": 2023,
    "licensePlate": "ABC-123",
    "vin": "1HGBH41JXMN109186",
    "color": "Silver",
    "mileage": 15000,
    "fuelType": "GASOLINE",
    "transmission": "AUTOMATIC",
    "type": "SEDAN",
    "seats": 5,
    "doors": 4,
    "engineSize": 2.5,
    "horsepower": 200,
    "dailyRate": 75.00,
    "description": "Comfortable sedan perfect for city driving",
    "features": ["Bluetooth", "GPS", "Backup Camera"],
    "location": "123 Main St, Downtown, City",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  }'
```

### 4. Create Rental

```bash
curl -X POST http://localhost:3000/history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "carId": "550e8400-e29b-41d4-a716-446655440000",
    "startDate": "2024-12-25T10:00:00Z",
    "endDate": "2024-12-27T18:00:00Z",
    "pickupLocation": "123 Main St, Downtown, City",
    "dropoffLocation": "456 Business Ave, Uptown, City",
    "notes": "Please deliver the car with a full tank of gas",
    "specialRequests": ["GPS navigation", "Insurance coverage"],
    "pickupInstructions": "Meet at the main entrance of the building",
    "dropoffInstructions": "Leave the car in the designated parking area"
  }'
```

### 5. Create Review

```bash
curl -X POST http://localhost:3000/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "carId": "550e8400-e29b-41d4-a716-446655440000",
    "historyId": "660e8400-e29b-41d4-a716-446655440000",
    "rating": 5,
    "title": "Excellent car rental experience!",
    "content": "The car was in perfect condition and the rental process was smooth. Highly recommend!",
    "cleanlinessRating": 5,
    "comfortRating": 4,
    "performanceRating": 5,
    "valueRating": 4,
    "customerServiceRating": 5,
    "tags": ["Great Experience", "Clean Car", "Good Value"],
    "featureComments": "The GPS navigation was very helpful for city driving",
    "processComments": "Pickup and drop-off were very convenient",
    "conditionComments": "Car was spotless and well-maintained"
  }'
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for different user types
- **Password Hashing**: Bcrypt encryption for user passwords
- **Input Validation**: Comprehensive request validation using class-validator
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: Protection against abuse and DDoS attacks

## 🏗️ Architecture

```
src/
├── admin/           # Admin management module
├── cars/            # Car management module
├── config/          # Configuration files
├── guard/           # Authentication guards
├── history/         # Rental history module
├── ranking/         # User ranking system
├── reviews/         # Review system
├── users/           # User management module
├── app.module.ts    # Main application module
└── main.ts          # Application entry point
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Database Schema

The system uses PostgreSQL with the following main entities:

- **Users**: Customer and owner accounts
- **Admins**: Administrative users
- **Cars**: Vehicle listings with detailed specifications
- **History**: Rental transactions and history
- **Reviews**: User feedback and ratings
- **Ranking**: Performance metrics and user rankings

## 🚀 Deployment

### Docker

```bash
# Build the image
docker build -t car-rental-api .

# Run the container
docker run -p 3000:3000 car-rental-api
```

### Environment Variables

Make sure to set all required environment variables in production:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=<strong-secret-key>
DB_HOST=<database-host>
DB_PORT=5432
DB_USERNAME=<db-username>
DB_PASSWORD=<db-password>
DB_DATABASE=<db-name>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Swagger documentation](http://localhost:3000/api-docs)
2. Review the API responses and error messages
3. Check the application logs for detailed error information
4. Open an issue in the repository

## 🔄 API Versioning

The current API version is **v1.0**. Future versions will maintain backward compatibility where possible.

---

**Happy coding! 🚗✨**
