# Minecraft Server List

A modern Minecraft server listing platform built with Next.js 14, Supabase, and Tailwind CSS.

## 🚀 Features

- **Server Listing**: Browse and search Minecraft servers by category
- **Voting System**: Vote for your favorite servers (24-hour cooldown)
- **User Authentication**: Sign up/login with Supabase Auth
- **Admin Panel**: Manage users, servers, tickets, and banners
- **Support Tickets**: Create and manage support tickets
- **Banner Ads**: Display promotional banners
- **Blog System**: Create and manage blog posts
- **Server Status**: Real-time server status checking via mcstatus.io API

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)
- Netlify account (for deployment)

## 🛠️ Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd minecraftserver3-main
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key
4. Copy your service role key (keep this secret!)

### 4. Configure environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
CORS_ORIGINS=*
```

### 5. Set up the database

1. Go to your Supabase project SQL Editor
2. Run the SQL scripts in this order:
   - `supabase_setup.sql` (creates base tables)
   - `supabase_update_auth_schema.sql` (adds auth, tickets, banners)
   - `supabase_blog_schema.sql` (adds blog tables - optional)

### 6. Create your first admin user

After registering through the app, run this SQL in Supabase:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 7. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Netlify Deployment

### Option 1: Deploy via Netlify Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider
   - Select your repository

3. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next` (Netlify will auto-detect with the plugin)

4. **Set environment variables**:
   - Go to Site settings → Environment variables
   - Add these variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `CORS_ORIGINS` (optional, default: `*`)

5. **Deploy**:
   - Click "Deploy site"
   - Wait for build to complete

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### Important Notes for Netlify:

- ✅ The `netlify.toml` file is already configured
- ✅ Next.js config has been optimized for Netlify
- ✅ Make sure to set all environment variables in Netlify dashboard
- ✅ The `@netlify/plugin-nextjs` plugin will be automatically installed

## 📁 Project Structure

```
minecraftserver3-main/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── page.js            # Home page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility functions
│   ├── supabase.js       # Supabase client
│   ├── mcstatus.js       # Server status checker
│   └── votifier.js       # Votifier integration
├── hooks/                # Custom React hooks
├── middleware.js         # Next.js middleware (auth)
├── next.config.js        # Next.js configuration
├── netlify.toml          # Netlify configuration
└── package.json          # Dependencies
```

## 🔧 Configuration

### Supabase Setup

1. **Database Tables**: Run the SQL scripts in order
2. **Authentication**: Supabase Auth is already configured
3. **Row Level Security**: RLS policies are set up in the SQL scripts

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | No |

## 🧪 Testing

Run the backend test suite:

```bash
python backend_test.py
```

Make sure your dev server is running on `http://localhost:3000`.

## 📝 API Endpoints

### Public Endpoints
- `GET /api/servers` - Get all servers
- `GET /api/servers/:id` - Get server details
- `POST /api/servers/:id/vote` - Vote for a server
- `GET /api/servers/:id/status` - Check server status

### Admin Endpoints (require admin role)
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/role` - Update user role
- `GET /api/admin/tickets` - Get all tickets
- `PATCH /api/admin/tickets/:id/close` - Close ticket
- `DELETE /api/admin/tickets/:id` - Delete ticket
- `DELETE /api/admin/servers/:id` - Delete server

## 🐛 Troubleshooting

### Build fails on Netlify
- Check that all environment variables are set
- Ensure Node.js version is 18+
- Check build logs for specific errors

### Database connection errors
- Verify Supabase credentials are correct
- Check that SQL scripts have been run
- Ensure RLS policies allow your operations

### Authentication not working
- Verify Supabase Auth is enabled
- Check middleware.js is properly configured
- Ensure cookies are allowed in browser

## 📄 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, create a support ticket in the admin panel or contact the development team.

---

**Built with ❤️ using Next.js, Supabase, and Tailwind CSS**

