Smart Waste Management System
An integrated MERN stack application designed to digitize and optimize the urban waste collection lifecycle. This system connects users, transporters, recyclers, and administrators through a unified platform, leveraging QR codes and real-time GPS tracking to enhance transparency, accountability, and operational efficiency.

📋 Project Overview
The Smart Waste Management System addresses the challenges of traditional waste collection by creating a transparent, trackable, and data-driven ecosystem. At its core, the application uses unique QR codes for user waste disposal validation and logs real-time GPS checkpoints for transporters. This ensures that every step of the collection process—from household pickup to final delivery at a recycling facility—is monitored and optimized. The result is a smarter, more efficient, and accountable waste management workflow.

✨ Key Features

📱 QR Code-Based Validation: Each user bin is assigned a unique QR code, which transporters scan to validate and log waste pickups.

🛰️ Real-Time GPS Tracking: Every scan records a geo-tagged checkpoint, creating a daily collection path for each transporter.

👤 Role-Based Dashboards: Customized interfaces and functionalities for four distinct roles: Admin, Transporter, Recycler, and User.

🗺️ Route Visualization: Admins can visualize transporter collection routes on a map, ensuring route compliance and identifying missed pickups.

📊 Analytics & Reporting: Generate insightful reports on waste collection volume, transporter efficiency, recycling statistics, and route performance.

🔐 Secure Authentication: Implemented with JSON Web Tokens (JWT) to ensure secure access for all user roles.

♻️ Recycling Integration: Tracks the type and weight of waste delivered to recycling centers, providing valuable data for sustainability initiatives.

⚙️ System Workflow
The operational flow is designed to be seamless and automated, minimizing manual intervention.

User → QR Code Generation: The system generates a unique QR code for each registered user/household.

Transporter → Waste Collection & Scanning: During pickup, the transporter scans the user's QR code using the mobile interface.

System → Checkpoint Logging: Upon a successful scan, the system automatically captures the transporter's ID and current GPS location, storing it as a timestamped checkpoint.

Transporter → Path Creation: As the transporter scans multiple QR codes throughout the day, a sequence of checkpoints forms a digital path of their collection route.

Recycler → Waste Segregation: The transporter delivers the collected waste to a recycling facility, where the recycler logs the type and quantity of materials received.

Admin → Monitoring & Optimization: The administrator accesses the central dashboard to monitor all activities, view transporter paths, analyze efficiency metrics, and generate comprehensive reports for strategic planning.

🚀 Technical Highlights
Architecture: Full-stack MERN (MongoDB, Express.js, React, Node.js) solution architected for scalability and real-time data processing.

QR Code Integration: Utilized html5-qrcode for robust client-side scanning and Cloudinary for dynamic QR code generation and management.

Real-Time Tracking: Engineered a checkpoint sequencing mechanism with duplicate-entry prevention to ensure data integrity and accurate route validation.

Security: Implemented secure JWT-based authentication and role-based access control (RBAC) to protect endpoints and data.

Backend: Built a scalable and resilient backend with Express.js and MongoDB, featuring a well-defined RESTful API.

Frontend: Delivered a responsive and intuitive user interface with React, providing seamless scan feedback, robust error handling, and dynamic data visualization.

🛠️ Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js & npm

MongoDB instance (local or cloud)



### 🔧 Environment Variables  

Create a `.env` file in the root directory and add the following:  

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

```

🧑‍💻 Our Team
This project was brought to life by the collaborative effort of a dedicated team:

Venkata Gowtham (Team Lead)

Jessy Robert

Mounika

Pavan Kumar

Sivasai

Chetana

Sandeep

Pranay Sai

Ullas

Charitha

Kavya

