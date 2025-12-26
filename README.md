# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## API Configuration (Mock vs Real)

This project uses MSW (Mock Service Worker) to intercept network requests and return mock data during development. You can toggle between mock mode and a real API backend.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_MOCK_API` | `true` | Set to `false` to disable MSW and use real API |
| `VITE_API_BASE_URL` | `http://localhost:3001` | Base URL for the real API server |

### Mock Mode (Default)

```bash
npm install
npm run dev
```

MSW will intercept all API requests and return mock responses that match the OpenAPI spec. This is ideal for frontend development without a backend.

### Real API Mode

Create a `.env.local` file in the project root:

```env
VITE_MOCK_API=false
VITE_API_BASE_URL=https://api.brpoly.com
```

Then start the dev server:

```bash
npm run dev
```

### API Client

All API calls must go through the centralized client at `src/lib/api/*`. Never use `fetch` directly in components.

```typescript
import { apiClient } from '@/lib/api';

// Example usage
const markets = await apiClient.listMarkets({ status: 'open' });
const balance = await apiClient.getBalance();
```

### OpenAPI Spec

The API contract is defined in `/brpoly/openapi.yaml`. All MSW handlers and TypeScript types are aligned with this spec.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
