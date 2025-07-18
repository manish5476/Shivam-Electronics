📦 Shivam Electronics Store Management System
A comprehensive and modern store management web application built with Angular for the frontend and Node.js with MongoDB for the backend. This system is designed to streamline operations for Shivam Electronics, covering customer, product, user, invoice, and payment management, along with an administrative dashboard and print functionalities. It also supports desktop deployment via Electron.

✨ Features
Customer Management: Full CRUD (Create, Read, Update, Delete) operations for customer records.

Product Management: Complete CRUD functionality for product inventory, including details like name, price, stock, and more.

User Management: Manage application users with different roles (e.g., admin, cashier, sales) and permissions.

Invoice Generation & Management:

Create detailed invoices for sales transactions.

Track invoice status (e.g., pending, paid, overdue).

View and manage existing invoices with comprehensive details.

Print Invoice: Dedicated functionality to generate printable versions of invoices.

Payment Processing: Record and manage payments against invoices.

Admin Dashboard: A centralized dashboard providing key insights and overviews of store performance.

Advanced Data Grids: Utilizes ag-Grid for powerful data presentation, featuring:

Sorting and Filtering

Column Resizing

Inline Editable Cells

Multi-row Selection

Custom Action Buttons (Edit, Save, Cancel, Delete) per row for streamlined record management.

Responsive User Interface: Built with Tailwind CSS and PrimeNG components for a modern, mobile-friendly design.

Desktop Application: Deployable as a native desktop application using Electron.

🚀 Technologies Used
Frontend (Angular)
Angular (v17+): The powerful framework for building dynamic single-page applications.

TypeScript: A superset of JavaScript that adds static typing.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

ag-Grid: A high-performance data grid component for displaying and interacting with large datasets.

PrimeNG: A comprehensive suite of UI components for Angular (e.g., Tables, Tags, Select, Toolbar).

Angular CLI: Command-line interface for Angular development.

Backend (Node.js)
Node.js: A JavaScript runtime for server-side development.

Express.js (Assumed): A fast, unopinionated, minimalist web framework for Node.js.

MongoDB: A NoSQL database for flexible data storage.

Mongoose (Assumed): An elegant MongoDB object modeling tool for Node.js.

Desktop Deployment
Electron: A framework for creating desktop applications with web technologies.

Electron Builder: A complete solution to package and build a ready for distribution Electron app.

📋 Prerequisites
Before you begin, ensure you have the following installed:

Node.js (LTS Version): Download & Install Node.js

npm: Comes with Node.js, or you can install Yarn: npm install -g yarn

Angular CLI: Install globally: npm install -g @angular/cli

MongoDB: Install MongoDB (Ensure a MongoDB instance is running, either locally or a cloud service like MongoDB Atlas).

Git: For cloning the repository.

⚙️ Installation
Follow these steps to set up the project locally.

1. Clone the Repository
git clone <repository-url>
cd shivam-electronics # Navigate into the project directory

2. Backend Setup
Navigate to your backend directory (e.g., server/ or backend/ if separate from the root). If your backend is in the same root as Angular, skip cd backend.

# Example: if your backend is in a 'server' folder
# cd server

npm install
# or
# yarn install

Environment Variables (.env)
Create a .env file in your backend root directory and configure it with necessary environment variables. Replace placeholders with your actual values:

PORT=3000
MONGODB_URI=mongodb://localhost:27017/shivam_electronics_db
JWT_SECRET=your_secret_key_for_jwt_tokens # Generate a strong, random key
# Add any other backend specific environment variables here (e.g., API keys)

3. Frontend Setup
Navigate back to the root of your Angular project (where package.json is located).

# If you changed directory for backend, go back to root
# cd ..

npm install
# or
# yarn install

▶️ Running the Application
1. Start the Backend Server
Open a new terminal, navigate to your backend directory (if separate), and start the server:

# Example: if your backend is in a 'server' folder
# cd server

npm start
# or (if your backend script is directly 'node server.js')
# node server.js

The backend server should now be running, typically on http://localhost:3000 (or the PORT you configured).

2. Start the Frontend Application
Open another terminal, navigate to your Angular project root, and run the frontend in your desired environment:

Development Mode
For local development with hot reloading:

npm run start:dev
# or
# ng serve --configuration=development

The application will be accessible at http://localhost:4200/ by default.

QA Mode
For testing in a QA environment setup:

npm run start:qa
# or
# ng serve --configuration=qa

Production Mode (Local Preview)
To preview a production-optimized build locally:

npm run start:prod
# or
# ng serve --configuration=production

🖥️ Running the Electron Desktop Application
To run the application as a native desktop app using Electron:

Development Desktop Build
This will build the Angular app in development mode and launch the Electron application:

npm run electron:dev

QA Desktop Build
This will build the Angular app in QA mode and launch the Electron application:

npm run electron:qa

Production Desktop Build
This will build the Angular app in production mode and launch the Electron application:

npm run electron:prod

📦 Building for Deployment
Building Web Application (Frontend)
To create optimized production builds for web deployment:

# Build for development environment
npm run build:dev

# Build for QA environment
npm run build:qa

# Build for production environment
npm run build:prod

The build artifacts will be placed in the dist/shivam-electronics directory.

Building Electron Desktop Application
To create distributable packages (installers) for your desktop application:

npm run dist

This command uses electron-builder to generate platform-specific installers (e.g., .exe for Windows, .dmg for macOS, .AppImage for Linux). The output will be in the dist/ directory (separate from the Angular dist).

📂 Project Structure
Here is a detailed breakdown of the project's file and folder structure:

.
├── app
│   ├── app.component.css
│   ├── app.component.html
│   ├── app.component.spec.ts
│   ├── app.component.ts
│   ├── app.config.server.ts
│   ├── app.config.ts
│   ├── app.routes.server.ts
│   ├── app.routes.ts
│   ├── assets
│   │   └── loader1.gif
│   ├── core
│   │   ├── auth.resolver.spec.ts
│   │   ├── auth.resolver.ts
│   │   ├── guards
│   │   │   ├── authguard.guard.spec.ts
│   │   │   └── authguard.guard.ts
│   │   ├── Interceptors
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── autopopulate.interceptor.ts
│   │   │   ├── error.interceptor.ts
│   │   │   └── loading.interceptor.ts
│   │   ├── Models
│   │   │   └── dashboard-models.ts
│   │   ├── services
│   │   │   ├── api.service.ts
│   │   │   ├── apigethandler.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── autopopulate.service.ts
│   │   │   ├── base-api.service.ts
│   │   │   ├── customer.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   ├── errorhandling.service.ts
│   │   │   ├── invoice.service.ts
│   │   │   ├── loading.service.ts
│   │   │   ├── message.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── product.service.ts
│   │   │   ├── seller.service.ts
│   │   │   └── user.service.ts
│   │   └── Utils
│   │       ├── common-method.service.spec.ts
│   │       └── common-method.service.ts
│   ├── interfaces
│   │   └── grid-context.interface.ts
│   ├── layouts
│   │   ├── dashboard
│   │   │   ├── home-page
│   │   │   │   ├── home-page.component.css
│   │   │   │   ├── home-page.component.html
│   │   │   │   ├── home-page.component.spec.ts
│   │   │   │   └── home-page.component.ts
│   │   │   └── home-page-1
│   │   │       ├── home-page-1.component.css
│   │   │       ├── home-page-1.component.html
│   │   │       ├── home-page-1.component.spec.ts
│   │   │       └── home-page-1.component.ts
│   │   ├── header
│   │   │   ├── header.component.css
│   │   │   ├── header.component.html
│   │   │   ├── header.component.spec.ts
│   │   │   └── header.component.ts
│   │   ├── main-dashboard
│   │   │   ├── main-dashboard.component.css
│   │   │   ├── main-dashboard.component.html
│   │   │   ├── main-dashboard.component.spec.ts
│   │   │   └── main-dashboard.component.ts
│   │   ├── mainlayout
│   │   │   ├── mainlayout.component.css
│   │   │   ├── mainlayout.component.html
│   │   │   ├── mainlayout.component.spec.ts
│   │   │   └── mainlayout.component.ts
│   │   └── sidebar
│   │       ├── sidebar.component.css
│   │       ├── sidebar.component.html
│   │       ├── sidebar.component.spec.ts
│   │       └── sidebar.component.ts
│   ├── Modules
│   │   ├── admin
│   │   │   ├── admin-dashboard
│   │   │   │   └── admin-dashboard.component.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── components
│   │   │       ├── admin-dashboard
│   │   │       │   └── admin-dashboard.component.ts
│   │   │       ├── admin-user
│   │   │       │   ├── admin-user.component.css
│   │   │       │   ├── admin-user.component.html
│   │   │       │   ├── admin-user.component.spec.ts
│   │   │       │   └── admin-user.component.ts
│   │   │       ├── dashboard-chart-combo
│   │   │       │   ├── dashboard-chart-combo.component.css
│   │   │       │   ├── dashboard-chart-combo.component.html
│   │   │       │   ├── dashboard-chart-combo.component.spec.ts
│   │   │       │   └── dashboard-chart-combo.component.ts
│   │   │       ├── dashboard-chart-component
│   │   │       │   ├── dashboard-chart-component.component.css
│   │   │       │   ├── dashboard-chart-component.component.html
│   │   │       │   ├── dashboard-chart-component.component.spec.ts
│   │   │       │   └── dashboard-chart-component.component.ts
│   │   │       ├── dashboard-summary
│   │   │       │   ├── dashboard-summary.component.css
│   │   │       │   ├── dashboard-summary.component.html
│   │   │       │   ├── dashboard-summary.component.spec.ts
│   │   │       │   └── dashboard-summary.component.ts
│   │   │       ├── dashboard-top-customer-view
│   │   │       │   ├── dashboard-top-customer-view.component.css
│   │   │       │   ├── dashboard-top-customer-view.component.html
│   │   │       │   ├── dashboard-top-customer-view.component.spec.ts
│   │   │       │   └── dashboard-top-customer-view.component.ts
│   │   │       └── sales-performace
│   │   │           └── sales-performace.component.ts
│   │   ├── auth
│   │   │   ├── auth.routes.ts
│   │   │   └── components
│   │   │       ├── login
│   │   │       │   ├── login.component.css
│   │   │       │   ├── login.component.html
│   │   │       │   ├── login.component.spec.ts
│   │   │       │   └── login.component.ts
│   │   │       ├── reset-password
│   │   │       │   ├── reset-password.component.css
│   │   │       │   ├── reset-password.component.html
│   │   │       │   ├── reset-password.component.spec.ts
│   │   │       │   └── reset-password.component.ts
│   │   │       ├── signup
│   │   │       │   ├── signup.component.css
│   │   │       │   ├── signup.component.html
│   │   │       │   ├── signup.component.spec.ts
│   │   │       │   └── signup.component.ts
│   │   │       └── update-password
│   │   │           ├── update-password.component.css
│   │   │           ├── update-password.component.html
│   │   │           ├── update-password.component.spec.ts
│   │   │           └── update-password.component.ts
│   │   ├── billing
│   │   │   ├── billing.routes.ts
│   │   │   └── components
│   │   │       ├── gst-invoice
│   │   │       │   ├── gst-invoice.component.css
│   │   │       │   ├── gst-invoice.component.html
│   │   │       │   ├── gst-invoice.component.spec.ts
│   │   │       │   └── gst-invoice.component.ts
│   │   │       ├── invoice-detailsview
│   │   │       │   ├── invoice-detailsview.component.css
│   │   │       │   ├── invoice-detailsview.component.html
│   │   │       │   ├── invoice-detailsview.component.spec.ts
│   │   │       │   └── invoice-detailsview.component.ts
│   │   │       ├── invoice-layout
│   │   │       │   ├── invoice-layout.component.css
│   │   │       │   ├── invoice-layout.component.html
│   │   │       │   ├── invoice-layout.component.spec.ts
│   │   │       │   └── invoice-layout.component.ts
│   │   │       ├── invoice-print
│   │   │       │   ├── invoice-print.component.css
│   │   │       │   ├── invoice-print.component.html
│   │   │       │   ├── invoice-print.component.spec.ts
│   │   │       │   └── invoice-print.component.ts
│   │   │       └── invoice-view
│   │   │           ├── invoice-view.component.css
│   │   │           ├── invoice-view.component.html
│   │   │           ├── invoice-view.component.spec.ts
│   │   │           └── invoice-view.component.ts
│   │   ├── customer
│   │   │   ├── components
│   │   │   │   ├── customer-detailed-list
│   │   │   │   │   ├── customer-detailed-list.component.css
│   │   │   │   │   ├── customer-detailed-list.component.html
│   │   │   │   │   ├── customer-detailed-list.component.spec.ts
│   │   │   │   │   └── customer-detailed-list.component.ts
│   │   │   │   ├── customerdetails
│   │   │   │   │   ├── customerdetails.component.css
│   │   │   │   │   ├── customerdetails.component.html
│   │   │   │   │   ├── customerdetails.component.spec.ts
│   │   │   │   │   └── customerdetails.component.ts
│   │   │   │   ├── customerlayout
│   │   │   │   │   ├── customerlayout.component.css
│   │   │   │   │   ├── customerlayout.component.html
│   │   │   │   │   ├── customerlayout.component.spec.ts
│   │   │   │   │   └── customerlayout.component.ts
│   │   │   │   ├── customer-list
│   │   │   │   │   ├── customer-list.component.css
│   │   │   │   │   ├── customer-list.component.html
│   │   │   │   │   ├── customer-list.component.spec.ts
│   │   │   │   │   └── customer-list.component.ts
│   │   │   │   └── customer-master
│   │   │   │       ├── customer-master.component.css
│   │   │   │       ├── customer-master.component.html
│   │   │   │       ├── customer-master.component.spec.ts
│   │   │   │       └── customer-master.component.ts
│   │   │   └── customer.routes.ts
│   │   ├── payment
│   │   │   ├── components
│   │   │   │   ├── payment
│   │   │   │   │   ├── payment.component.css
│   │   │   │   │   ├── payment.component.html
│   │   │   │   │   ├── payment.component.spec.ts
│   │   │   │   │   └── payment.component.ts
│   │   │   │   ├── payment-list
│   │   │   │   │   ├── payment-list.component.css
│   │   │   │   │   ├── payment-list.component.html
│   │   │   │   │   ├── payment-list.component.spec.ts
│   │   │   │   │   └── payment-list.component.ts
│   │   │   │   └── view-payment
│   │   │   │       ├── view-payment.component.css
│   │   │   │       ├── view-payment.component.html
│   │   │   │       ├── view-payment.component.spec.ts
│   │   │   │       └── view-payment.component.ts
│   │   │   └── payment.routes.ts
│   │   ├── PersonalInfo
│   │   │   ├── about-us
│   │   │   │   ├── about-us.component.css
│   │   │   │   ├── about-us.component.html
│   │   │   │   ├── about-us.component.spec.ts
│   │   │   │   └── about-us.component.ts
│   │   │   └── personalinfo.routes.ts
│   │   ├── product
│   │   │   ├── components
│   │   │   │   ├── product-detail
│   │   │   │   │   ├── product-detail.component.css
│   │   │   │   │   ├── product-detail.component.html
│   │   │   │   │   ├── product-detail.component.spec.ts
│   │   │   │   │   └── product-detail.component.ts
│   │   │   │   ├── product-layout
│   │   │   │   │   ├── product-layout.component.css
│   │   │   │   │   ├── product-layout.component.html
│   │   │   │   │   ├── product-layout.component.spec.ts
│   │   │   │   │   └── product-layout.component.ts
│   │   │   │   ├── product-list
│   │   │   │   │   ├── product-list.component.css
│   │   │   │   │   ├── product-list.component.html
│   │   │   │   │   ├── product-list.component.spec.ts
│   │   │   │   │   └── product-list.component.ts
│   │   │   │   └── product-master
│   │   │   │       ├── product-master.component.css
│   │   │   │       ├── product-master.component.html
│   │   │   │       ├── product-master.component.spec.ts
│   │   │   │       └── product-master.component.ts
│   │   │   └── product.routes.ts
│   │   ├── seller
│   │   │   ├── components
│   │   │   │   ├── sellers
│   │   │   │   │   ├── sellers.component.css
│   │   │   │   │   ├── sellers.component.html
│   │   │   │   │   ├── sellers.component.spec.ts
│   │   │   │   │   └── sellers.component.ts
│   │   │   │   ├── sellers-details
│   │   │   │   │   ├── sellers-details.component.css
│   │   │   │   │   ├── sellers-details.component.html
│   │   │   │   │   ├── sellers-details.component.spec.ts
│   │   │   │   │   └── sellers-details.component.ts
│   │   │   │   └── sellers-list
│   │   │   │       ├── sellers-list.component.css
│   │   │   │       ├── sellers-list.component.html
│   │   │   │       ├── sellers-list.component.spec.ts
│   │   │   │       └── sellers-list.component.ts
│   │   │   └── seller.routes.ts
│   │   └── shared
│   │       ├── AgGrid
│   │       │   ├── AgGridcomponents
│   │       │   │   ├── actionbuttons
│   │   │   │   │   │   ├── actionbuttons.component.css
│   │   │   │   │   │   ├── actionbuttons.component.html
│   │   │   │   │   │   ├── actionbuttons.component.spec.ts
│   │   │   │   │   │   └── actionbuttons.component.ts
│   │   │   │   │   ├── ag-grid-reference
│   │   │   │   │   │   └── ag-grid-reference.component.ts
│   │   │   │   │   ├── dialogbox
│   │   │   │   │   │   ├── dialogbox.component.css
│   │   │   │   │   │   ├── dialogbox.component.html
│   │   │   │   │   │   ├── dialogbox.component.spec.ts
│   │   │   │   │   │   └── dialogbox.component.ts
│   │   │   │   │   ├── dynamic-cell
│   │   │   │   │   │   ├── dynamic-cell.component.css
│   │   │   │   │   │   ├── dynamic-cell.component.html
│   │   │   │   │   │   ├── dynamic-cell.component.spec.ts
│   │   │   │   │   │   └── dynamic-cell.component.ts
│   │   │   │   │   └── paymentpopup
│   │   │   │   │       ├── paymentpopup.component.css
│   │   │   │   │       ├── paymentpopup.component.html
│   │   │   │   │       ├── paymentpopup.component.spec.ts
│   │   │   │   │       └── paymentpopup.component.ts
│   │   │   │   └── grid
│   │   │   │       └── shared-grid
│   │   │   │           ├── shared-grid.component.css
│   │   │   │           ├── shared-grid.component.html
│   │   │   │           ├── shared-grid.component.spec.ts
│   │   │   │           └── shared-grid.component.ts
│   │   │   ├── Common
│   │   │   │   └── loader
│   │   │   │       ├── loader.component.css
│   │   │   │       ├── loader.component.html
│   │   │   │       ├── loader.component.spec.ts
│   │   │   │       └── loader.component.ts
│   │   │   └── Components
│   │   │       ├── common-layout
│   │   │       │   ├── common-layout.component.css
│   │   │       │   ├── common-layout.component.html
│   │   │       │   ├── common-layout.component.spec.ts
│   │   │       │   └── common-layout.component.ts
│   │   │       ├── keenslidercommon
│   │   │       │   ├── keenslidercommon.component.css
│   │   │       │   ├── keenslidercommon.component.html
│   │   │       │   ├── keenslidercommon.component.spec.ts
│   │   │       │   └── keenslidercommon.component.ts
│   │   │       ├── notfound
│   │   │       │   ├── notfound.component.css
│   │   │       │   ├── notfound.component.html
│   │   │       │   ├── notfound.component.spec.ts
│   │   │       │   └── notfound.component.ts
│   │   │       └── toolbar
│   │   │           ├── toolbar.component.css
│   │   │           ├── toolbar.component.html
│   │   │           ├── toolbar.component.spec.ts
│   │   │           └── toolbar.component.ts
├── environments
├── index.html
├── main.server.ts
├── main.ts
├── server.ts
└── styles.css

💡 API Endpoints (Conceptual)
Assuming a RESTful API structure, here are the general endpoints that the frontend interacts with:

GET /api/customers: Retrieve all customers.

GET /api/customers/:id: Retrieve a single customer by ID.

POST /api/customers: Create a new customer.

PUT /api/customers/:id: Update an existing customer.

DELETE /api/customers/:id: Delete a customer.

GET /api/products: Retrieve all products.

POST /api/products: Create a new product.

PUT /api/products/:id: Update a product.

DELETE /api/products/:id: Delete a product.

GET /api/users: Retrieve all users.

POST /api/users: Create a new user (e.g., for registration).

PUT /api/users/:id: Update a user.

DELETE /api/users/:id: Delete a user.

POST /api/auth/login: User authentication.

GET /api/invoices: Retrieve all invoices.

GET /api/invoices/:id: Retrieve a single invoice by ID.

POST /api/invoices: Create a new invoice.

PUT /api/invoices/:id: Update an invoice.

GET /api/invoices/:id/print: Endpoint for printing/generating print-ready invoice.

POST /api/payments: Record a new payment.

GET /api/dashboard/summary: Retrieve dashboard summary data.

🗃️ Database Schema (Conceptual)
The MongoDB database is expected to have collections for each major entity, typically structured as follows:

customers: Stores customer details (e.g., name, contact, address, GSTIN).

products: Stores product information (e.g., name, description, price, stockQuantity, HSN/SAC).

users: Stores user authentication and profile data (e.g., username, passwordHash, email, role, permissions).

invoices: Stores invoice records, including invoice details, references to sellerDetails, buyerDetails, and an array of items (referencing products), paymentTerms, totalAmount, status, invoiceNumber, invoiceDate, dueDate, placeOfSupply, notes, and tax breakdowns.

payments: Records payment transactions (e.g., invoiceId, amountPaid, paymentDate, paymentMethod).

Each document in these collections would typically have standard fields like _id (MongoDB's unique identifier), createdAt, and updatedAt.

🤝 Contributing
Contributions are welcome! If you'd like to contribute, please follow these steps:

Fork the repository.

Create a new branch for your feature or bug fix: git checkout -b feature/your-feature-name

Make your changes and ensure tests pass.

Commit your changes: git commit -m "feat: Add new feature"

Push to your fork: git push origin feature/your-feature-name

Open a Pull Request to the main branch of the original repository.

Please ensure your code adheres to the existing style and conventions.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.