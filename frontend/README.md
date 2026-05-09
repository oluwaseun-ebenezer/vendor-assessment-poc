# Vendor Assessment Platform - Frontend

Complete React + TypeScript frontend for the Carlsberg Vendor Assessment PoC platform.

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **TanStack React Query** - Server state management
- **React Hook Form + Zod** - Form handling & validation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client + React Query hooks
│   │   ├── client.ts     # Axios instance with JWT interceptor
│   │   ├── auth.ts       # Authentication hooks
│   │   ├── vendors.ts    # Vendor CRUD hooks
│   │   ├── assessments.ts # Assessment hooks with polling
│   │   ├── tasks.ts      # Task management hooks
│   │   ├── analytics.ts  # Analytics hooks
│   │   ├── users.ts      # User management hooks (admin)
│   │   └── reports.ts    # Report generation hooks
│   ├── components/
│   │   ├── ui/           # shadcn/ui components (Button, Card, etc.)
│   │   ├── layout/       # AppLayout with navigation
│   │   ├── auth/         # ProtectedRoute component
│   │   └── shared/       # StatusBadge, RiskFlagBadge
│   ├── pages/
│   │   ├── LoginPage.tsx         # Authentication
│   │   ├── DashboardPage.tsx     # Vendor pipeline list
│   │   ├── VendorDetailPage.tsx  # Individual vendor view
│   │   ├── MetricsPage.tsx       # Analytics dashboard
│   │   ├── TasksPage.tsx         # Action items management
│   │   └── AdminUsersPage.tsx    # User management (admin only)
│   ├── hooks/
│   │   └── useAuth.tsx   # Auth context & helpers
│   ├── lib/
│   │   ├── utils.ts      # Helper functions
│   │   └── constants.ts  # App constants & labels
│   ├── types/
│   │   └── index.ts      # TypeScript interfaces
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind imports + theme
├── public/
├── index.html
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind theme
├── tsconfig.json         # TypeScript config
└── package.json
```

## Features

### 🔐 Authentication

- JWT-based authentication
- Automatic token refresh on 401 errors
- Protected routes with role-based access control
- Login page with demo credentials

### 📊 Dashboard

- Vendor pipeline with search & filters
- Real-time status tracking (Submitted, In Review, Cleared, Rejected)
- Risk flag filtering (Green, Amber, Red)
- Quick stats cards
- Sortable, paginated table

### 🔍 Vendor Detail Page

- Company information overview
- Technology stack display
- Assessment results with 8 dimension scores
- Run/re-run assessment button with polling
- Action items list
- Document attachments

### 📈 Analytics Dashboard

- Key metrics: Total vendors, Avg score, Time to assess/onboard
- Efficiency gain calculation vs manual baseline
- Risk distribution pie chart
- Vendor status distribution bar chart

### ✅ Tasks Management

- Filterable task list (Open, In Progress, Done)
- Priority indicators (High, Medium, Low)
- Department tagging
- Quick status updates
- Vendor association

### 👥 Admin Panel (Admin only)

- User management table
- Role assignment
- Active/Inactive status
- User creation (UI placeholder)

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Environment Configuration

The frontend proxies API requests to the backend via Vite's proxy configuration:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://backend:8000',
      changeOrigin: true,
    },
  },
}
```

In production (with Docker), nginx handles routing:

- `/` → Frontend (port 3000)
- `/api/*` → Backend (port 8000)

## API Integration

All API calls use React Query for:

- Automatic caching
- Background refetching
- Optimistic updates
- Polling (for assessment status)
- Error handling

Example:

```typescript
const { data: vendors, isLoading } = useVendors({
  search: "OpenAI",
  status: "in_review",
  risk_flag: "amber",
});
```

## Authentication Flow

1. User logs in with email/password
2. Backend returns JWT access token (15 min) + refresh token (7 days)
3. Tokens stored in localStorage
4. Axios interceptor adds Bearer token to all requests
5. On 401 error → attempt refresh → retry original request
6. On refresh failure → redirect to /login

## Role-Based Access Control

| Role          | Access                                           |
| ------------- | ------------------------------------------------ |
| Admin         | Full access including user management            |
| Procurement   | Vendor intake, commercial dimension, tasks       |
| IT Security   | Security dimension, integration dimension, tasks |
| Legal         | Legal/IP dimension, tasks                        |
| AI Innovation | Product maturity dimension, read-only            |

## Styling

- **Tailwind CSS** for utility-first styling
- **shadcn/ui** components for consistent design
- **Custom theme colors** for risk flags and statuses
- **Responsive design** with mobile-first approach
- **Dark mode ready** (theme CSS variables included)

## Demo Credentials

```
Admin:
- Email: admin@example.com
- Password: admin123

Procurement:
- Email: procurement@example.com
- Password: password
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with React.lazy (if needed)
- React Query automatic caching
- Debounced search inputs
- Virtualized lists for large datasets (if needed)
- Optimistic UI updates

## Future Enhancements

- [ ] Vendor submission form (multi-step wizard)
- [ ] Real-time notifications with WebSockets
- [ ] Advanced search with filters
- [ ] Bulk operations (approve multiple vendors)
- [ ] Export to Excel/CSV
- [ ] Drag-and-drop file upload
- [ ] Dark mode toggle
- [ ] Internationalization (i18n)
- [ ] Unit tests with Vitest
- [ ] E2E tests with Playwright

## Contributing

Follow the existing code structure and conventions:

- Use TypeScript strict mode
- Follow the eslint configuration
- Use React Query for all API calls
- Use shadcn/ui components first before creating custom ones
- Keep components small and focused
- Extract reusable logic into custom hooks

## License

Carlsberg Group - Internal PoC
