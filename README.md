Shivam Electronics - Full-Stack Management System
📖 Overview
Welcome to the Shivam Electronics project! This is a comprehensive, full-stack application designed as a powerful inventory, sales, and customer management system (a small-scale ERP). It features a professional-grade architecture on both the Node.js backend and the Angular frontend, built for scalability, maintainability, and a superior user experience.

The system is equipped with a suite of advanced features including secure authentication with multi-level roles, a dynamic and reusable data grid, a stunning theme engine with light/dark modes, and detailed analytics dashboards.

✨ Key Features
🛡️ Secure Authentication & Authorization:

JWT-based authentication flow with secure token handling.

Robust Role-Based Access Control (RBAC) with four levels (user, staff, admin, superAdmin) to protect routes and actions.

Full password management suite, including password reset via email.

🏢 Multi-Tenancy Architecture (Backend):

Data is securely partitioned by an owner field, ensuring that users can only access their own data.

The superAdmin role has global access to all data for system-wide management.

🚀 High-Performance Angular Frontend:

Built with modern, standalone components and a clean, modular architecture (core, shared, feature modules).

Dynamic Theming Engine: A powerful ThemeService that allows users to switch between light and dark modes and choose from over 20 predefined accent color palettes, with all changes persisted in local storage.

Reusable AG Grid Component: A highly configurable, shared data grid component with built-in support for in-line editing, status badges, and bulk actions, all compatible with the AG Grid Community version.

⚙️ Powerful & Consistent API (Backend):

Full CRUD functionality with unified endpoints that handle both single and bulk operations (create, update, delete) for high efficiency.

Advanced querying via ApiFeatures utility, allowing for flexible filtering, sorting, and pagination directly from URL parameters.

📊 Advanced Analytics & Dashboards:

A suite of backend endpoints powered by the MongoDB Aggregation Framework to provide deep insights.

Visually stunning and interactive charts that are fully theme-aware, inspired by professional tools like TradingView.

Comprehensive dashboard views for sales, products, and customer analytics.

💻 Tech Stack
Frontend
Framework: Angular 18+ (Standalone Components)

UI Library: PrimeNG 18+

Data Grids: AG Grid Community

Styling: Tailwind CSS, PrimeIcons

State Management: RxJS (BehaviorSubject)

Desktop (Optional): Electron

Backend
Runtime: Node.js

Framework: Express.js

Database: MongoDB with Mongoose ODM

Authentication: JSON Web Token (JWT), bcrypt.js

Security: Helmet, Express Rate Limit, Express Mongo Sanitize, XSS-Clean, HPP

Logging: Winston, Morgan

🏗️ Project Structure (Angular)
The Angular application follows a professional, modular structure for maximum scalability and organization.

src/app/core/: Contains the foundational building blocks of the application.

services/: Centralized, singleton services (e.g., AuthService, ThemeService, ApiService).

guards/: Route guards for authentication and role-based access (AuthGuard, RoleGuard).

Interceptors/: HTTP interceptors for automatically attaching JWTs, handling errors, and managing loading states.

Models/: TypeScript interfaces for data structures.

src/app/Modules/: Feature modules, each representing a major part of the application (e.g., admin, auth, customer, product). This keeps the code for each feature isolated and self-contained.

src/app/layouts/: The main layout components of the application, such as the HeaderComponent, SidebarComponent, and the MainLayoutComponent that holds them together.

src/app/shared/: Contains highly reusable components, pipes, and directives that can be used across multiple feature modules. The powerful SharedGridComponent and its sub-components reside here.

🚀 Getting Started
Follow these steps to get the project up and running on your local machine.

Prerequisites
Node.js (v20.x or later recommended)

Angular CLI (v18.x or later)

MongoDB installed and running locally or a connection string to a cloud instance.

Installation & Setup
Clone the repository:

git clone https://github.com/manish5476/Shivam-Electronics.git
cd Shivam-Electronics

Install dependencies:
This will install both the backend and frontend dependencies.

npm install

Set up Environment Variables:
You will need to create two environment files: one for the backend and one for the frontend.

Backend: Create a file named .env.dev in the root of the project.

Frontend: Create a file named src/environments/environment.ts.

Copy the contents from the corresponding .example files (if provided) or use the templates below.

Backend (.env.dev)
NODE_ENV=development
PORT=4000
DATABASE=mongodb://127.0.0.1:27017/shivam-electronics
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
CORS_ORIGIN=http://localhost:4200

Frontend (src/environments/environment.ts)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api/v1'
};

Run the application:
You will need two terminals to run both the backend and frontend servers.

Terminal 1: Start the Backend Server

# This command needs to be configured in your package.json scripts
# to point to your backend's entry file.
npm run start:server 

Terminal 2: Start the Angular Frontend

npm start

Open your browser and navigate to http://localhost:4200.