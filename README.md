# PropDesk - Real Estate CRM

A private, company-internal CRM built specifically for a Dubai-based real estate agency. PropDesk streamlines agent management, lead tracking, and deal pipelines — all behind a secure login accessible only to the company's CEO and agents.

> **Note:** This is not a public portal or SaaS product. It is a custom-built internal tool for a single organization.
>
> ---
>
> ## Features
>
> - **Agent Dashboard** — Each agent gets a personalized view of their leads, listings, and pipeline
> - - **Lead Management** — Track client inquiries from first contact to closed deal
>   - - **Deal Pipeline** — Visual pipeline to monitor deal progress across stages
>     - - **Role-Based Access** — CEO has full visibility; agents see only their own data
>       - - **Real-Time Updates** — Powered by Convex for instant data sync across users
>        
>         - ---
>
> ## Tech Stack
>
> | Layer | Technology |
> |-------|-----------|
> | Frontend | React, TypeScript |
> | Styling | Tailwind CSS |
> | Backend | Convex (real-time serverless) |
> | Build Tool | Vite |
> | Deployment | Vercel |
>
> ---
>
> ## Getting Started
>
> ```bash
> # Clone the repository
> git clone https://github.com/Mubashir236/propdesk.git
>
> # Navigate to the project
> cd propdesk
>
> # Install dependencies
> npm install
>
> # Start the development server
> npm run dev
> ```
>
> ---
>
> ## Project Structure
>
> ```
> propdesk/
> ├── convex/          # Convex backend functions & schema
> ├── public/          # Static assets
> ├── src/             # React application source
> ├── index.html       # Entry HTML file
> ├── tailwind.config.js
> ├── vite.config.ts
> └── package.json
> ```
>
> ---
>
> ## Author
>
> **Mubashir Khan** — [GitHub](https://github.com/Mubashir236)
