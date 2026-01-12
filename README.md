# E-Commerce Application

A full-stack e-commerce application built with Spring Boot and React, featuring Stripe payment integration and an admin dashboard for order management.

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2
- Spring Security with JWT
- Spring Data JPA
- H2 Database (embedded)
- Stripe Java SDK

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Stripe React SDK

## Features

### Customer Features
- Browse product catalog
- View product details
- Add/remove items from cart
- Persistent shopping cart (localStorage)
- Multi-step checkout process
- Secure payment with Stripe
- Order confirmation and history

### Admin Features
- Dashboard with order statistics
- View and manage all orders
- Update order status (Pending → Paid → Processing → Shipped → Delivered)
- View payment status
- Product inventory overview

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- npm or yarn
- Stripe account (for payment processing)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure Stripe API keys in `src/main/resources/application.properties`:
   ```properties
   stripe.api.key=sk_test_your_secret_key
   stripe.publishable.key=pk_test_your_publishable_key
   ```

3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend will start on http://localhost:8080

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on http://localhost:5173

## Demo Accounts

The application comes with pre-seeded demo accounts:

| Role  | Email              | Password |
|-------|-------------------|----------|
| Admin | admin@example.com | admin123 |
| User  | user@example.com  | user123  |

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all active products |
| GET | `/api/products/{id}` | Get product details |
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders/{id}` | Get order details |
| POST | `/api/payments/create-intent` | Create Stripe payment intent |
| POST | `/api/payments/confirm` | Confirm payment |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/config/stripe` | Get Stripe publishable key |

### Admin Endpoints (Requires ADMIN role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/orders` | List all orders |
| GET | `/api/admin/orders/{id}` | Get order details |
| PUT | `/api/admin/orders/{id}/status` | Update order status |
| GET | `/api/admin/products` | List all products |

## Project Structure

```
project1/
├── backend/
│   ├── src/main/java/com/ecommerce/
│   │   ├── config/          # Security, CORS, JWT configuration
│   │   ├── controller/      # REST API controllers
│   │   ├── dto/             # Data transfer objects
│   │   ├── model/           # JPA entities
│   │   ├── repository/      # Data access layer
│   │   └── service/         # Business logic
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── data.sql         # Seed data
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── context/         # React context (Cart, Auth)
    │   ├── pages/           # Page components
    │   │   └── admin/       # Admin dashboard pages
    │   ├── services/        # API client
    │   ├── App.jsx          # Main app with routing
    │   └── main.jsx         # Entry point
    ├── package.json
    └── vite.config.js
```

## Testing Stripe Payments

Use Stripe's test card numbers for testing:

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0025 0000 3155 | Requires authentication |

Use any future expiration date and any 3-digit CVC.

## Database

The application uses H2 embedded database for simplicity. Data is stored in memory and resets on restart.

- H2 Console: http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:ecommerce`
- Username: `sa`
- Password: (empty)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | - |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | - |
| `JWT_SECRET` | Secret for JWT signing | (default provided) |

## License

MIT
