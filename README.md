# EVE Voyager

A modern Next.js web application to explore the EVE Online universe using the ESI (EVE Swagger Interface) API.

## 🚀 Features

- **EVE Online SSO Authentication** : Secure connection with EVE Online accounts
- **User Profile** : Profile page with connected character information
- **Modern Interface** : UI built with shadcn/ui and Radix UI
- **Responsive** : Adaptive design for all devices

## 🛠️ Technologies Used

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** + **Radix UI** for components
- **pnpm** as package manager
- **Vercel** for deployment
- **EVE Online SSO** for authentication

## 📦 Installation

1. Clone the repository:

```bash
git clone <your-repo>
cd eve-voyager
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

   - Check `ENV_SETUP.md` for detailed instructions
   - Create a `.env.local` file with your EVE SSO keys
   - Get your keys from [https://developers.eveonline.com/](https://developers.eveonline.com/)

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment on Vercel

1. Connect your repository to Vercel
2. Vercel will automatically detect Next.js
3. Deployment will happen automatically

## 📚 API Endpoints

The application exposes endpoints for EVE Online SSO authentication:

- `GET /api/auth/eve/login` - Initiate SSO connection
- `GET /api/auth/eve/callback` - Handle authentication callback
- `POST /api/auth/eve/logout` - User logout
- `GET /api/auth/eve/session` - Check active session

## 🎨 UI Components

The application uses shadcn/ui with the following components:

- Button
- Card
- Input
- Label
- Select
- Table
- Badge
- Avatar

## 📝 Project Structure

```
src/
├── app/
│   ├── api/auth/eve/     # API routes for EVE SSO authentication
│   ├── profile/          # User profile page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Main layout
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx   # React authentication context
├── lib/
│   └── utils.ts          # Utilities
└── types/
    └── auth.ts           # TypeScript types for authentication
```

## 🔧 Configuration

The application uses EVE Online SSO authentication. You need to configure environment variables for SSO keys (see instructions in the environment variables configuration file).

## 📄 License

This project is licensed under the MIT License.
