# CityFix

A web application for reporting and tracking city infrastructure issues.

## Features

- Report city infrastructure issues with photos and location
- Track issue status and updates
- Upvote important issues
- Comment on issues
- Admin dashboard for issue management
- Real-time updates

## Tech Stack

- React
- TypeScript
- Supabase (Backend & Storage)
- Tailwind CSS
- Shadcn UI

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CityFix.git
cd CityFix
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
