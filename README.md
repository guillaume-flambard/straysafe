# 🐾 StraySafe

A mobile-first collaborative app to monitor, manage and protect stray or fostered dogs in specific regions.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd straysafe
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

4. Set up your Supabase database:
   - Create a new Supabase project
   - Run the SQL from `supabase/schema.sql` in your Supabase SQL editor
   - This will create all necessary tables, RLS policies, triggers, and initial data
   - Optionally, run `supabase/seed.sql` to add sample dogs for testing

### Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 📱 Features

- **Authentication**: Email/password login with Supabase Auth
- **Dog Management**: Track status, health, and location of dogs
- **Role-based Access**: Admin, volunteer, vet, and viewer roles
- **Location-based**: Multi-location support (Koh Phangan, etc.)
- **Timeline Events**: Track vet visits, adoptions, transfers, and notes
- **Privacy Levels**: Public, private, and sensitive information handling

## 🏗️ Tech Stack

- **Frontend**: Expo React Native + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Navigation**: Expo Router
- **Styling**: React Native StyleSheet

## 📁 Project Structure

```
├── app/                    # App screens and layouts
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── contexts/              # React contexts
├── lib/                   # Utilities and configurations
├── supabase/              # Database schema and migrations
└── assets/                # Images and fonts
```

## 🗄️ Database Schema

- **locations**: Regional locations (Koh Phangan, etc.)
- **users**: User profiles with roles and location assignment
- **dogs**: Dog profiles with status, health, and metadata
- **events**: Timeline events for each dog

## 🔐 User Roles

- **Admin**: Full access to all data and user management
- **Volunteer**: Access to dogs they're assigned to
- **Vet**: Access to dog medical information only
- **Viewer**: Read-only access to public information

## 🚧 Development Status

✅ Project setup and configuration
✅ Authentication system
✅ Database schema and RLS policies
✅ Dog listing and profile screens
✅ User profile management
🚧 Dog CRUD operations
🚧 Timeline/events system
🚧 Location selection
🚧 Photo upload functionality

## 📝 License

This project is licensed under the MIT License.
