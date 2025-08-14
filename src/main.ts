import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with explicit configuration for development
  app.enableCors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true, // Allow credentials
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Car Rental API')
    .setDescription(`
      A comprehensive car rental management system API with the following features:
      
      ## 🚗 **Core Features**
      - **User Management**: Customer registration, authentication, and profile management
      - **Car Management**: Vehicle listings, availability, and owner management
      - **Rental System**: Booking, payment, and rental history tracking
      - **Review System**: User ratings and feedback for cars and experiences
      - **Admin Panel**: Comprehensive administrative controls and analytics
      - **Ranking System**: Performance metrics and user ratings
      
      ## 🔐 **Authentication**
      - JWT-based authentication for all protected endpoints
      - Role-based access control (ADMIN, CUSTOMER, OWNER)
      - Secure password hashing with bcrypt
      
      ## 📊 **User Roles**
      - **ADMIN**: Full system access, user management, analytics
      - **CUSTOMER**: Browse cars, make rentals, leave reviews
      - **OWNER**: List cars, manage availability, view earnings
      
      ## 🚀 **Getting Started**
      1. Register a new user account
      2. Login to get your JWT token
      3. Use the token in the Authorization header: \`Bearer <your-token>\`
      4. Explore the available endpoints based on your role
    `)
    .setVersion('1.0')
    .addTag('Authentication', 'User registration, login, and JWT management')
    .addTag('Users', 'User profile management and operations')
    .addTag('Admin', 'Administrative operations and system management')
    .addTag('Cars', 'Vehicle management, listings, and availability')
    .addTag('Rentals', 'Car rental operations and history')
    .addTag('Reviews', 'User feedback and rating system')
    .addTag('Ranking', 'Performance metrics and user rankings')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .setContact('API Support', 'https://github.com/your-repo', 'support@carrental.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Swagger UI setup with custom options
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      displayOperationId: false,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Car Rental API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { font-size: 2.5em; margin: 20px 0; }
      .swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
      .swagger-ui .scheme-container { margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 5px; }
    `,
  });

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api-docs`);
}
bootstrap();
