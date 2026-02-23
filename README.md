# SAIL Slayer v2.0

Automatic SAIL (Student Academic Information Login) Slayer with dual authentication support (OTP and Password).

## 🚀 Features

- **Dual Authentication**: Support for both OTP and Password-based login
- **Modern UI**: Glassmorphism design with gradient backgrounds
- **Secure**: Token-based session management
- **Analytics**: Google Analytics 4 integration
- **Performance**: Vercel Analytics and Speed Insights
- **Responsive**: Mobile-friendly design
- **TypeScript**: Full type safety

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules
- **HTTP Client**: Axios
- **Deployment**: Vercel
- **Analytics**: Google Analytics 4, Vercel Analytics
- **Fonts**: Geist Sans, Geist Mono, Poppins

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SailSolver.vercel.app
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📂 Project Structure

```
SailSolver.vercel.app/
├── app/
│   ├── api/
│   │   └── authenticate/
│   │       └── route.ts          # Authentication API endpoint
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard page
│   │   └── dashboard.module.css  # Dashboard styles
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with analytics
│   ├── loading.tsx               # Loading component
│   ├── page.tsx                  # Login page
│   └── page.module.css           # Login page styles
├── public/
│   └── favicon.ico               # App icon
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## 🔐 Authentication Flow

1. User enters SEC ID
2. Selects authentication method:
   - **OTP**: System sends OTP to registered contact
   - **Password**: User enters their password
3. Submits credentials
4. Server validates and returns session token
5. User redirected to dashboard

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
```

Deploy the `.next` folder and `public` directory to your hosting provider.

## 📊 Analytics

The application includes:
- **Google Analytics 4**: Page views and user tracking
- **Vercel Analytics**: Traffic and performance metrics
- **Vercel Speed Insights**: Core Web Vitals monitoring

## 🔒 Security Features

- HTTPS enforcement
- Session token-based authentication
- Secure headers (X-Frame-Options, X-Content-Type-Options)
- Input validation
- CSRF protection
- Content Security Policy ready

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes only.

## ⚠️ Disclaimer

This application is designed for authorized users only. Ensure you have proper permissions before using the SAIL authentication system.

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and TypeScript
