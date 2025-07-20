# 🐾 StraySafe – Mobile App Screen Structure

## 🌐 Purpose
StraySafe is a mobile-first collaborative app designed to manage and monitor stray or fostered dogs by location.  
It supports sensitive cases, allows collaboration between rescuers, fosters, and vets, and is initially focused on **Koh Phangan**, but scalable to other regions.

---

## 🧭 App Navigation Overview

📍 LocationSelector (on first launch or logout)
└── Bottom Tabs:
├─ 🐶 DogsListScreen
│   └─ DogProfileScreen
│       └─ TimelineEventScreen (modal)
├─ 🗓 CalendarScreen
├─ 🧑‍🤝‍🧑 UsersScreen
│   └─ UserProfileScreen
└─ ⚙️ SettingsScreen


---

## 📍 1. LocationSelectorScreen

**Goal**: Let user pick their current rescue zone.

- List or map of available locations
- Search bar (e.g., “Chiang Mai”, “Koh Phangan”)
- Local storage: user remembers last location
- Admins can add a new location

---

## 🐶 2. DogsListScreen

**Goal**: Browse and manage all dogs by status and location.

- Grid or list of dogs
- Filters: by status (`fostered`, `adopted`, `sick`, etc.)
- Tags: `urgent`, `puppy`, `sensitive case`
- Floating `+ Add Dog` button (Admin/Volunteer only)

### ➤ DogProfileScreen
- Header with name, status, age, gender
- Location and responsible humans:
  - Rescuer
  - Foster
  - Vet
- Section: "Timeline of events"
- `+ Add Event` button

### ➤ TimelineEventScreen (modal)
- Add new event to timeline:
  - Type: `Vet`, `Adoption`, `Transfer`, `Incident`, `Note`
  - Description (markdown/text)
  - Optional photo (upload to Supabase)
  - Privacy: `public`, `private`, `sensitive`
  - Timestamp, author auto-assigned

---

## 🗓 3. CalendarScreen

**Goal**: View and manage key upcoming events.

- Monthly/weekly/day calendar view
- Event types: vet appointments, deadlines, planned transfers, sterilization
- Add/edit events (Admin/Volunteer)

---

## 🧑‍🤝‍🧑 4. UsersScreen

**Goal**: View and manage app users per location.

- Filter by role: `admin`, `vet`, `volunteer`, `viewer`
- List with name, email, last activity
- Admins can `+ Invite User`

### ➤ UserProfileScreen
- Info: name, email, role
- Dogs assigned
- Locations allowed
- Last activity timestamp

---

## ⚙️ 5. SettingsScreen

**Goal**: Manage account and preferences.

- Update profile
- Current location info
- Language preference (future)
- Toggle notifications (coming soon)
- Logout
- Admin-only: link to Supabase dashboard or n8n endpoints

---

## 🔄 Example User Flow

1. App opens → `LocationSelectorScreen`
2. User selects “Koh Phangan”
3. → `DogsListScreen` (filtered)
4. → Clicks on dog "Aisha" → `DogProfileScreen`
5. → Adds a sensitive transfer note → `TimelineEventScreen` (modal)
6. → Views upcoming vet date → `CalendarScreen`

---

## 🔐 Roles & Access

| Screen | Admin | Volunteer | Vet | Viewer |
|--------|-------|-----------|-----|--------|
| LocationSelector | ✅ | ✅ | ✅ | ✅ |
| DogsList | ✅ | ✅ | ✅ | ✅ |
| DogProfile | ✅ | ✅ | ✅ | ✅ (public) |
| Add/Edit Dog | ✅ | ✅ | ❌ | ❌ |
| TimelineEvent (sensitive) | ✅ | ✅ (assigned only) | ✅ | ❌ |
| Calendar | ✅ | ✅ | ❌ | ❌ |
| UsersScreen | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ✅ | ✅ | ✅ |

---

## 🔧 Tech Context

- React Native via Expo (mobile)
- Supabase (auth, DB, media)
- AsyncStorage (location & auth caching)
- Optional: n8n for automation and alerts
- Later: Push Notifications (Expo / Firebase)

---

## ✅ Ready to Build?

You can generate screen components from this structure using AI tools like Claude, Cline, or Copilot.  
Want a full `screens/` folder generated as React Native `.tsx` files?