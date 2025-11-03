# Link Shortening Service

A modern, full-featured URL shortener built with Next.js, Firebase, and Tailwind CSS. Create, manage, and track shortened links with real-time analytics.

## 🌐 Live Demo

Visit the live application at: **[https://smlss.vercel.app](https://smlss.vercel.app)**

## ✨ Features

### 🔗 Link Management
- **Create Short Links**: Transform long URLs into short, shareable links
- **Custom Aliases**: Optionally create custom short codes (3-20 characters, alphanumeric with hyphens/underscores)
- **Auto-Generated Codes**: Automatically generates unique 7-character short codes when no custom alias is provided
- **URL Validation**: Ensures all URLs are valid and start with `http://` or `https://`
- **Link List**: View all your shortened links in one place with real-time updates

### 📊 Analytics & Tracking
- **Click Tracking**: Automatically tracks every click on your shortened links
- **Total Click Count**: See the total number of clicks for each link
- **Click History by Date**: View daily click breakdowns in an easy-to-read format
- **Individual Click Timestamps**: Detailed log of every click with exact timestamp
- **Analytics Dashboard**: Dedicated analytics page for each link with comprehensive statistics

### 🔐 Authentication
- **Google Sign-In**: Quick authentication with your Google account
- **Email/Password**: Traditional email and password registration and login
- **Protected Routes**: Secure access - users must authenticate to create and manage links
- **Session Management**: Persistent login sessions across page refreshes

### 🎨 User Interface
- **Modern Design**: Clean, responsive interface built with Tailwind CSS
- **Real-time Updates**: Links automatically appear in your list when created, without page refresh
- **Copy to Clipboard**: One-click copy functionality for your shortened URLs
- **Quick Actions**: Visit links, view analytics, and delete links directly from the list
- **Loading States**: Smooth loading indicators for better user experience
- **Error Handling**: Clear error messages and validation feedback

### 🔄 Link Redirection
- **Automatic Redirects**: Short links (`/s/[shortCode]`) automatically redirect to the original URL
- **Click Tracking**: Every redirect is tracked and counted in real-time
- **Error Handling**: Graceful handling of invalid or expired links

### 🗑️ Link Deletion
- **Delete Links**: Remove links you no longer need
- **Cascade Deletion**: All associated click data is automatically removed when a link is deleted
- **Confirmation Dialogs**: Prevents accidental deletions

## 🛠️ Technologies Used

- **Frontend Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Real-time Updates**: Firebase Realtime Listeners
- **Language**: TypeScript
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Main dashboard (link list)
│   ├── login/
│   │   └── page.tsx            # Authentication page
│   ├── links/
│   │   └── [shortCode]/
│   │       └── page.tsx        # Link analytics page
│   └── s/
│       └── [shortCode]/
│           └── page.tsx        # Link redirection page
├── components/
│   ├── CopyButton.tsx          # Copy to clipboard component
│   ├── DeleteButton.tsx        # Delete confirmation component
│   ├── EmailPasswordAuth.tsx   # Email/password authentication
│   ├── LinkForm.tsx            # Create short link form
│   ├── LinkItem.tsx            # Individual link display component
│   └── SignInWithGoogle.tsx    # Google authentication component
└── lib/
    ├── contexts/
    │   └── AuthContext.tsx     # Authentication context provider
    ├── firebase/
    │   ├── firebase.ts         # Firebase configuration
    │   └── firebaseUtils.ts    # Firebase utility functions
    ├── hooks/
    │   └── useAuth.ts          # Authentication hook
    └── utils/
        └── linkUtils.ts        # Link validation and generation utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Firebase project set up with Firestore and Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd link-shortening-service
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project
   - Enable Firestore Database
   - Enable Authentication (Email/Password and Google providers)
   - Copy your Firebase config to `src/lib/firebase/firebase.ts`

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Usage

1. **Sign In**: Use Google or email/password to authenticate
2. **Create a Link**: Enter a long URL and optionally a custom alias
3. **Manage Links**: View all your links, copy them, or visit the analytics page
4. **Track Performance**: Click "Analytics" on any link to see detailed click statistics
5. **Share Links**: Use the shortened URLs (`/s/[shortCode]`) anywhere you need shorter links

## 🔒 Security Features

- User authentication required for link creation
- Users can only view and delete their own links
- Link ownership verification for analytics access
- Secure URL validation

## 🌟 Key Features in Detail

### Custom Aliases
Create memorable short links with custom aliases like:
- `smlss.vercel.app/s/my-website`
- `smlss.vercel.app/s/product-launch`

### Real-time Analytics
Watch your link performance update in real-time as clicks happen:
- Daily click breakdowns
- Complete click history with timestamps
- Total click counter that updates automatically

### Responsive Design
Works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## 📄 License

This project is open source and available for use and modification.

---

Built with ❤️ using Next.js and Firebase
