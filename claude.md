# 🐾 StraySafe – Mobile App Spec

## ✨ Goal
Design a mobile-first collaborative app to monitor, manage and protect stray or fostered dogs in specific regions.  
The first active zone will be **Koh Phangan, Thailand**, but the system must support multi-location scalability (e.g. Chiang Mai, Bali, Athens).

The app should allow a small trusted network of rescuers, fosters and vets to:
- Track each dog's status, health, and events
- Coordinate actions (vet visits, transfers, adoptions)
- Preserve sensitive information (conflicts, hidden data)
- Avoid relying on messy WhatsApp groups

---

## 📱 App Name
**StraySafe**

---

## 🌍 Core Features

### 1. 🗺 Location Selection
- Upon login or start, user selects a **location** (ex: “Koh Phangan”)
- Each location has its own list of dogs, users and events
- Admins can add new locations

### 2. 🐶 Dog Profiles
- Name, photo, gender, birth date or age
- Status: `fostered`, `available`, `adopted`, `injured`, `missing`, `hidden`, `deceased`
- Location: textual + GPS (optional)
- Related humans: rescuer, current foster, vet, adopter
- Sterilized? ✅/❌  
- Tags: `puppy`, `urgent`, `shy`, etc.

### 3. 📓 Timeline / Events (per dog)
- Create an event (text + optional image)
- Event type: `Vet`, `Adoption`, `Transfer`, `Note`, `Incident`
- Optional privacy flag: `public` / `private` / `sensitive`
- Timestamp + author

### 4. 👥 User Roles
- `admin`: full access to all data + user management
- `volunteer`: access to dogs they’re assigned to
- `vet`: access to dog medical info only
- `viewer`: read-only public info

### 5. 🔐 Auth
- Supabase email auth
- Optional: Google login
- Each user linked to one or more location(s)

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile frontend | **Expo (React Native)** + TypeScript |
| Backend | **Supabase** (PostgreSQL + Auth + Storage) |
| Media | Supabase Storage (dog photos, event photos) |
| Admin Panel | Appsmith (optional) |
| Notifications | via **n8n** (for internal emails or future push) |
| Hosting | Supabase or self-hosted on VPS (optional) |

---

## 🐕 Initial Seed Data (for Koh Phangan)

### Example Dog: Aisha
```json
{
  "name": "Aisha",
  "gender": "female",
  "status": "in foster care",
  "birth_date": "2024-11-01",
  "sterilized": false,
  "location": "Koh Phangan",
  "rescue_date": "2025-06-15",
  "foster": "Alexandra",
  "notes": "Has 6 puppies. Was about to be adopted by Emile, but redirected due to mental health concerns.",
  "tags": ["mom", "gentle", "brown", "sensitive_case"]
}