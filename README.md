# Menal. Portfolio

A cinematic, fully dynamic portfolio for a full stack developer and digital marketer, with a private admin dashboard.
Theme: Midnight Plum + Soft Ivory. Fonts: Space Grotesk and Inter. Plain CSS only (no Tailwind, no Bootstrap).

- **Frontend:** React, Vite, React Router, Axios, Lucide React, CSS keyframes/transitions, Intersection Observer
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs, Multer, Cloudinary, Helmet, CORS, rate limiting
- **Everything on the public site comes from the database.** Nothing about your projects, skills, bio or contact details is hardcoded in React.

```
menal-portfolio/
  frontend/   React + Vite app (public site at /, admin at /admin)
  backend/    Express API (config, controllers, models, routes, middleware, services, utils, scripts)
  README.md
```

## What you get

Public site: animated landing page (letter-by-letter MENAL., rotating titles, interactive thread-mesh canvas, custom cursor, magnetic buttons, parallax), About, Expertise, Selected Projects, Development Projects (category filter), Digital Marketing Showcase, Experience, Resume, Contact, and a detail page for every project (gallery with lightbox, video, links, related work).

Admin (`/admin`): secure login, overview, projects (add/edit/delete, cover + gallery uploads, categories, publish/unpublish, featured), categories, marketing campaigns (creatives, SEO work, social content, editable performance figures), About/contact/social links, skills, experience, resume PDF upload/replace, contact enquiries, change password.

Publishing a project (or campaign) in the admin makes it appear on the public site immediately. Replacing the resume PDF changes what the public download serves. There is no public registration; there is exactly one administrator.

Nothing is pre-filled with results, statistics or achievements. Performance figures appear only if you type them in.

---

## 1. Prerequisites (Windows)

1. **Node.js 18 or newer (LTS)**: https://nodejs.org. After installing, open a new terminal and check `node -v`.
2. **Visual Studio Code**: https://code.visualstudio.com
3. Free accounts: **MongoDB Atlas** (https://www.mongodb.com/atlas) and **Cloudinary** (https://cloudinary.com).

## 2. Extract and open in VS Code

1. Right-click `menal-portfolio.zip` and choose **Extract All...**. Pick a folder such as `C:\Projects`.
2. Open VS Code, choose **File > Open Folder...** and select the extracted `menal-portfolio` folder (the one that contains `frontend` and `backend`).
3. Open a terminal with **Terminal > New Terminal** (PowerShell is fine). You will use two terminals, one for the backend and one for the frontend (the **+** button adds another).

## 3. Set up MongoDB Atlas

1. In Atlas create a free **M0** cluster.
2. **Database Access** > Add New Database User. Choose a username and password (use letters and digits, or URL-encode special characters). Give it *Read and write to any database*.
3. **Network Access** > Add IP Address. For local development click *Add Current IP Address*. For a deployed backend you will need the host's IP, or `0.0.0.0/0` (allow from anywhere; acceptable only because the database is protected by the user and password).
4. **Database** > Connect > *Drivers*. Copy the connection string. It looks like `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`.
5. Insert your database name before the `?`: `...mongodb.net/menal-portfolio?retryWrites=true&w=majority`.

## 4. Set up Cloudinary

1. Sign in to Cloudinary and open the **Dashboard**. Note the **Cloud name**, **API Key** and **API Secret**.
2. **Important for the resume PDF:** open *Settings > Security* and make sure **"PDF and ZIP files delivery"** is **enabled** (new accounts have it switched off, which makes the public resume download fail with an error). Save the change.

## 5. Configure and install the backend

In the VS Code terminal:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

Open `backend\.env` and fill it in:

| Variable | What to put |
| --- | --- |
| `MONGODB_URI` | The Atlas connection string from step 3 |
| `JWT_SECRET` | A long random string (32+ characters). Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `CLIENT_URL` | `http://localhost:5173` for local work (comma-separate more origins when deployed) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From step 4 |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Your admin login (password at least 10 characters). Used only by the seed script |

`.env` is git-ignored and must never be shared or committed.

## 6. Create the admin account

Still inside `backend`:

```powershell
npm run seed:admin
```

It creates the single admin (or updates it if you run it again, for example to reset a forgotten password). Afterwards, **delete `ADMIN_PASSWORD` from `.env`**.

Optional starter content (safe to skip, safe to re-run):

```powershell
npm run seed:content
```

This creates the five categories, your skills list, and your five named projects **as drafts with no descriptions or results**. Fill them in from the admin and publish them.

## 7. Install the frontend

Open a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
```

Leave `VITE_API_URL` empty for local development. Vite proxies `/api` to the backend on port 5000.

## 8. Run everything

Terminal 1 (backend):

```powershell
cd backend
npm run dev
```

You should see `MongoDB connected` and `API running on http://localhost:5000`.

Terminal 2 (frontend):

```powershell
cd frontend
npm run dev
```

- Portfolio: http://localhost:5173
- Admin dashboard: http://localhost:5173/admin (sign in with the credentials from step 5)

Tip: from the project root you can also run `npm run install:all`, `npm run dev:backend` and `npm run dev:frontend`.

## 9. First steps in the admin

1. **About and contact**: your tagline, About text, portrait, email, phone, location, social links.
2. **Categories**: the five required categories exist after `seed:content`; add or rename as you like.
3. **Projects**: open a project, add description, technologies, cover and gallery images, URLs, then set Status to *Published*. Use the star icon to feature it in "Selected projects".
4. **Marketing**: add campaigns, upload creatives, describe SEO and social work, and add performance metrics you can verify.
5. **Resume**: upload your PDF. Uploading again replaces it.
6. **Skills / Experience**: add entries.
7. **Appearance & Design**: choose a seasonal theme, preview the full portfolio, then publish it. Draft selections remain private until published.

Projects without images show a generated placeholder until you upload real artwork.

Appearance settings are stored in the `SiteAppearance` MongoDB singleton collection. No additional environment variables are required. The only available portfolio template is the existing Creative design; the appearance schema leaves room for future template types without exposing unfinished choices.

The published season also controls the decorative weather and locally rendered SVG landscape in the page atmosphere. Seasonal scene layers cross-fade with the theme, and their movement respects the visitor's reduced-motion preference.

API endpoints:

- `GET /api/public/appearance` — published appearance only.
- `GET /api/admin/appearance` — published and draft settings (admin JWT required).
- `PUT /api/admin/appearance` — update the draft `season` and/or `template` (admin JWT required).
- `POST /api/admin/appearance/publish` — publish the current draft (admin JWT required).
- `POST /api/admin/appearance/reset` — reset the draft to published settings (admin JWT required).

## 10. Testing the API yourself

With the backend running and the admin credentials in `.env`:

```powershell
cd backend
npm run smoke
```

This exercises authentication, appearance draft/publish and validation, project publishing, campaigns, contact, and upload validation. It creates and removes test records and restores the appearance settings. Run it against a development database.

## 11. Deployment

### Backend (Render, Railway, or any Node host)

1. Push the project to GitHub (the `.gitignore` already excludes secrets and `node_modules`).
2. Create a **Web Service** from the repo with *Root directory* `backend`, *Build command* `npm install`, *Start command* `npm start`.
3. Set environment variables: `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_*`, and `CLIENT_URL=https://your-frontend-domain` (no trailing slash; comma-separate several).
4. In Atlas *Network Access*, allow the host (`0.0.0.0/0` is the simple option).
5. Create the admin once: run `npm run seed:admin` from your own computer with `MONGODB_URI` pointing at the same Atlas database, or from the host's shell.

### Frontend (Vercel, Netlify, Cloudflare Pages)

1. *Root directory* `frontend`, *Build command* `npm run build`, *Output directory* `dist`.
2. Environment variable: `VITE_API_URL=https://your-backend-host/api`.
3. Single-page-app routing is already configured (`public/_redirects` for Netlify, `vercel.json` for Vercel), so `/admin` and `/projects/...` links work on refresh.
4. Add the final frontend URL to `CLIENT_URL` on the backend and redeploy it.

Free Render instances sleep after inactivity, so the first request can take around 30 seconds.

## 12. Security notes

- Passwords hashed with bcrypt (cost 12). JWT sessions expire (default 7 days). Login attempts are rate limited (10 per 15 minutes), the contact form too (8 per hour), and the whole API has a general limit.
- Helmet security headers, strict CORS allow-list, request body size limits, Mongo operator stripping, whitelisted fields on every write, URL validation (http/https only), image type/size checks (8 MB) and PDF checks (type, size 10 MB, `%PDF-` header).
- Admin endpoints live under `/api/admin` and need a valid token. There is no registration endpoint.
- The contact form has a hidden honeypot field against bots.
- The admin token is stored in the browser's localStorage. Sign out on shared computers.

## 13. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Backend exits with `Missing environment variable` | You skipped `Copy-Item .env.example .env` or left values empty |
| `MongooseServerSelectionError` | Atlas Network Access does not include your IP, or the password in the URI is wrong or needs URL-encoding |
| Site shows "The site could not load" | Backend is not running, or `CLIENT_URL` does not match the site's address |
| `Origin not allowed by CORS` | Add the exact site origin (with `https://`, without trailing slash) to `CLIENT_URL` |
| Uploads say Cloudinary is not configured | Fill the three `CLOUDINARY_*` values and restart the backend |
| Resume download shows a 401 or error page | Enable *PDF and ZIP files delivery* in Cloudinary (step 4.2) |
| Port already in use | Change `PORT` in `backend\.env` and `DEV_API_TARGET` for the frontend (`DEV_API_TARGET=http://localhost:5001` in `frontend\.env`) |
| Forgot admin password | Set a new `ADMIN_PASSWORD` in `backend\.env` and run `npm run seed:admin` |

## 14. Customising

- Colours are CSS variables at the top of `frontend/src/styles/tokens.css`.
- Public sections live in `frontend/src/components`, admin screens in `frontend/src/admin`.
- Animations respect `prefers-reduced-motion` and the custom cursor and magnetic effects only run on devices with a mouse.
