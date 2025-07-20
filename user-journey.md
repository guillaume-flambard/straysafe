# 🐾 StraySafe – User Journey (v1)

StraySafe is a mobile-first app for tracking and managing stray and fostered dogs by region.  
This document outlines the default **user flow** for new and returning users.  
The first deployment is focused on **Koh Phangan (Thailand)**, but the system supports multiple locations.

---

## 🎬 1. Onboarding & First Login

### 🆕 First-time User Flow
- The user launches the app for the first time.
- They are prompted to select a **rescue zone**:
  - Dropdown or searchable list: e.g., *Koh Phangan, Chiang Mai, Bali*
- After selecting a zone, the user proceeds to **Sign Up / Login**:
  - Via email + password (Supabase)
  - Or Google Login (if enabled)

🎯 After login, the app stores the location preference (in AsyncStorage) and loads relevant data.

---

## 🐶 2. Dogs List Screen

Upon login, the user lands on:

**“Dogs in [Location]” screen**

- Scrollable list or grid of dog cards
- Each card shows:
  - Name
  - Photo
  - Status: `fostered`, `available`, `adopted`, `sick`, etc.
  - Tags: `urgent`, `puppy`, `hidden`, etc.
- Filters available by status, gender, tags, etc.

➡️ The user taps on **“Aisha”** to view her profile.

---

## 📄 3. Dog Profile: “Aisha”

The dog profile contains:

- 🖼 Main photo, gender, age, sterilization
- 📍 Location + assigned humans:
  - Foster (Alexandra)
  - Rescuer (Hazal)
  - Vet (Dr. Noon)
- 🔐 If marked as a sensitive case:
  > `"Sensitive case – not visible to viewers"`

### 📓 Timeline Section
A vertical log of key events:
- `2025-07-15`: "Transferred to foster Alexandra. (Sensitive: redirected from Emile)"
- `2025-07-16`: "Vet check complete. Vaccine due: 22/07"

✅ A `+ Add Event` button allows authorized users to submit:
- Text update
- Photo upload
- Event type (Vet, Transfer, Note, etc.)
- Privacy level (`public`, `private`, `sensitive`)

---

## 🗓 4. Calendar View

The user visits the **Calendar Tab**:
- Displays upcoming:
  - Vet appointments
  - Sterilizations
  - Adoption dates
- Events are color-coded by type

➡️ The user taps on a calendar item to view/edit (if authorized)

---

## 🧑‍🤝‍🧑 5. Users Management (Admin only)

Admins can open the **Users screen**:
- List of all users assigned to the current location
- Display name, email, role, last activity
- `+ Invite User` button to add new users via email

➡️ Admins can modify user roles or revoke access

---

## ⚙️ 6. Settings

Users can manage preferences:
- Edit profile info (name, avatar)
- Change current location
- Toggle notification settings (if available)
- View current role & permissions
- Logout

---

## 🧪 Sample Use Cases

### 🔹 Emile (Viewer)
- Can only see dogs marked as `available`
- Cannot see Aisha (marked `sensitive` and `hidden`)
- Cannot post events

### 🔹 Hazal (Admin)
- Can see all dogs
- Can post sensitive events on any dog’s timeline
- Can manage user roles and permissions

### 🔹 Alexandra (Volunteer)
- Can view only the dogs she fosters
- Can post vet visits or daily notes to her dogs
- Cannot see or edit other dogs

---

## 🔁 Full Flow Example

1. User opens app → `LocationSelector`
2. Selects “Koh Phangan”
3. Logs in → sees `DogsListScreen`
4. Taps “Aisha” → enters `DogProfileScreen`
5. Adds an event → opens `TimelineEventScreen`
6. Views upcoming vet visit in `CalendarScreen`

---
