# TaskMaster - Personal & Team Task Management Application

A comprehensive, feature-rich task management application built with Next.js 15, TypeScript, and Supabase. TaskMaster empowers individuals and teams to organize, prioritize, and complete their work efficiently across all devices.

## 🚀 Features

### Core Task Management
- ✅ Create, read, update, and delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Real-time task synchronization
- ✅ Bulk operations (select, delete, complete multiple tasks)

### Organization & Prioritization
- 🎯 Three priority levels (High, Medium, Low) with visual indicators
- 📅 Due date management with overdue highlighting
- 🏷️ Custom categories with color coding
- 🔍 Real-time search across task titles and descriptions
- 📊 Advanced filtering (completion status, priority, category, date range)

### User Experience
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🌙 Dark/Light theme with system preference support
- ⌨️ Keyboard navigation and shortcuts
- ♿ WCAG 2.1 AA accessibility compliance
- ⚡ Sub-second performance with optimized loading states

### Data Management
- 💾 Automatic saving with cloud storage
- 🔒 Secure authentication with Supabase Auth
- 🛡️ Row Level Security (RLS) for data protection
- 📈 Task completion statistics and analytics

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, React 19
- **State Management**: Redux Toolkit (RTK) with RTK Query
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: Radix UI primitives + custom components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Validation**: Zod schemas
- **Icons**: Heroicons

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account and project

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd taskmaster
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and API keys
3. In the Supabase SQL Editor, run the `database-schema.sql` file to set up the database schema

### 4. Environment setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router pages and API routes
│   ├── api/             # Backend API endpoints
│   │   ├── tasks/       # Task CRUD operations
│   │   └── categories/  # Category management
│   ├── globals.css      # Global styles and CSS variables
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Home page with auth and dashboard
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── features/       # Feature-specific components
│   └── providers/      # Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── store/              # Redux store with RTK Query APIs
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🔧 Configuration

### Database Schema
The application uses the following main tables:
- `tasks` - User tasks with priority, due dates, and categories
- `categories` - User-defined categories for organizing tasks
- Row Level Security (RLS) ensures users can only access their own data

### Authentication
- Supabase Auth handles user registration and login
- JWT tokens for API authentication
- Automatic session management

### State Management
- Redux Toolkit for global state
- RTK Query for API calls and caching
- Optimistic updates for better UX

## 🎨 Customization

### Themes
The app supports light, dark, and system themes. Customize colors by modifying CSS variables in `src/app/globals.css`.

### Components
All UI components are built with Tailwind CSS and can be easily customized. Check the `src/components/ui/` directory for base components.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## 🔐 Security Features

- Row Level Security (RLS) in Supabase
- JWT token authentication
- Input validation with Zod
- CSRF protection
- Secure headers configuration

## 📊 Performance

- Server-side rendering (SSR) with Next.js
- Optimistic updates for instant UI feedback
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Caching strategies with RTK Query

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives

## 📞 Support

If you have any questions or need help, please:
1. Check the documentation above
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

Built with ❤️ using modern web technologies