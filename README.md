# SuperBrain-BE

SuperBrain-BE is the backend for the SuperBrain application, built with Node.js, Express, TypeScript, and MongoDB.

## Tech Stack

- Node.js (TypeScript)
- Express.js
- MongoDB (via Mongoose)
- JWT Authentication
- Zod Validation
- Bcrypt for password hashing

## Setup Instructions

1. Clone the Repository
```bash
git clone https://github.com/daanish04/SuperBrain-BE
cd SuperBrain-BE
```

2. Install Dependencies
```bash
npm install
```

3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
MONGO_URI=your_mongo_connection_string
PORT=3000
JWT_SECRET=your_secret_key
```

4. Run Locally
```bash
npm run dev
```
Backend will be available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| POST | /signup | Register new user | No |
| POST | /signin | User login | No |
| POST | /content | Create content | Yes |
| GET | /content | Get user's content | Yes |
| DELETE | /content | Delete content | Yes |
| GET | /content/tags | Get all tags | No |
| POST | /brain/share | Share or remove share link | Yes |
| GET | /brain/:shareLink | Get public shared content | No |

## Example

Request:
```http
POST /signin
{
  "username": "john",
  "password": "12345"
}
```

Response:
```json
{
  "token": "JWT_TOKEN"
}
```

## Deployment (Render)

1. Push the repository to GitHub.
2. Create a new Web Service on Render.
3. Set environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`).
4. Deploy.
