Naval Fleet Maintenance Management Portal (NFMMP)
A role-based web portal for managing fictional naval fleet equipment,
personnel, inspections, reported problems, repairs, and maintenance
activities.
Demo safety: This is a demonstration system. Use fictional fleet
and equipment data only. Do not enter classified, operational, or
sensitive military information.

Features
Admin / Commander
- View the command dashboard and fleet summary.
- Create and manage Officer and Technician accounts.
- Manage equipment records and personnel status.
Officer
- View fleet information.
- Register and manage equipment.
- Review technician inspection submissions.
- Review reported equipment problems.
Technician
- View assigned equipment.
- Submit inspection records.
- Report equipment problems.
Repairs, maintenance, reports, and notifications may require further
integration testing. Do not describe them as production-ready until
verified.
Technology Stack
- Frontend: React, Vite, JavaScript, CSS
- Backend: Node.js, Express
- Database: MongoDB Atlas, Mongoose
- Authentication: JSON Web Tokens (JWT)
- Real-time communication: Socket.IO
- Scheduled tasks: node-cron
- Deployment: Vercel (frontend), Render (backend)
Live Demo
- Frontend:
  https://naval-fleet-maintenance-management-portal.vercel.app
- Backend health check:
  https://naval-fleet-maintenance-management-portal.onrender.com/
Project Structure
NFFMP/
├── frontend/       # React + Vite client
│   ├── src/
│   └── package.json
├── server/         # Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
└── .gitignore
Run Locally
Prerequisites
- Node.js (LTS recommended)
- npm
- MongoDB Atlas database or local MongoDB
1. Clone the repository
git clone https://github.com/rc-142007/Naval-Fleet-Maintenance-Management-Portal.git
cd Naval-Fleet-Maintenance-Management-Portal
2. Configure and start the backend
cd server
npm install
Create server/.env locally. Never commit this file.
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret
ADMIN_SETUP_KEY=your_admin_setup_key
NODE_ENV=development
Start the backend:
npm start
The API runs at http://localhost:5000 unless another port is
configured.
3. Configure and start the frontend
Open a second terminal:
cd frontend
npm install
Create frontend/.env.local:
VITE_API_URL=http://localhost:5000/api
Start the frontend:
npm run dev
Vite prints the local frontend URL in the terminal (commonly
http://localhost:5173).
Environment Variables
Backend
  Variable                            Purpose
  PORT                              Backend port. Render provides this
automatically in deployment.

  MONGO_URI                         MongoDB connection string.

  JWT_SECRET                        Secret used to sign and verify
authentication tokens.

  ADMIN_SETUP_KEY                   Secret for the admin setup flow, if
enabled.

  NODE_ENV                          Use production when deployed and
development locally.
FRONTEND_URL                      Optional frontend origin, if read
by the backend CORS configuration.
Frontend
  Variable                            Purpose
  VITE_API_URL                      Backend API base URL, including /api,
e.g. https://your-backend.onrender.com/api.
Only browser-safe values belong in variables prefixed with VITE_.
Never put database credentials, JWT secrets, or admin setup keys in
frontend variables.
Deployment
Backend --- Render
1. Connect the GitHub repository.
2. Set the root directory to server.
3. Build command: npm install
4. Start command: npm start
5. Add backend environment variables in Render's Environment settings.
6. Allow the exact deployed frontend origin in the backend's Express
   and Socket.IO CORS configuration.
7. Configure MongoDB Atlas network access for the deployed backend.
   Prefer restricted access using the provider's documented outbound IP
   ranges; avoid leaving unrestricted database access enabled.
Frontend --- Vercel
1. Import the GitHub repository as a separate Vercel project.
2. Set root directory to frontend.
3. Framework preset: Vite.
4. Build command: npm run build.
5. Output directory: dist.
6. Set VITE_API_URL to the Render backend URL ending in /api.
7. Redeploy after changing environment variables.
For React single-page routing, add frontend/vercel.json:
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
Security
- Never commit .env, .env.local, credentials, database connection
  strings, or private keys.
- Do not publish demo usernames or passwords in this README or in a
  public repository.
- Create or reset demo accounts through the authorized admin workflow.
- Rotate any password that has been shared in chat, screenshots,
  source control, or another public location.
- Restrict MongoDB Atlas network access wherever practical.
- Use HTTPS for deployed services.
- Use fictional sample data only.
Current Demo Scope
The core demonstration flow covers: 1. Admin/Commander login and
dashboard. 2. Personnel account management. 3. Equipment registration
and technician assignment. 4. Technician inspection submission. 5.
Technician problem reporting. 6. Officer review of inspections and
reported problems.

Verify each role and page on the deployed environment before presenting.
Describe unverified features as planned or in progress.
Troubleshooting
- Login cannot reach the server: Check VITE_API_URL, Render
  service status, and the browser Network tab.
- CORS error: Confirm the exact Vercel production domain is
  allowed by both Express and Socket.IO CORS settings, then redeploy
  the backend.
- Nested page returns Vercel 404: Add the SPA rewrite above and
  redeploy the frontend.
- MongoDB connection error: Check MONGO_URI in Render and the
  MongoDB Atlas IP access list.
- Changes do not appear: Confirm the latest commit is deployed and
  redeploy after changing environment variables.
License
Add the license and ownership terms applicable to this project before
distributing it publicly.


for usage and demo and for information:contact=>7995479616
