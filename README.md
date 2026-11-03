# SmartAttend – QR-Based School Attendance Management System

SmartAttend is a modern, responsive, full-stack QR attendance management system designed for schools, colleges, and educational institutions. Teachers can generate dynamic, time-limited QR codes with cryptographically random tokens, while students scan using their device cameras to record attendance with strict anti-duplicate and expiry enforcement.

---

## 🌟 Key Features

### 👩‍🏫 Faculty / Teacher Portal
- **Dashboard Analytics**: Real-time KPI cards (Total Students, Total Classes, Today's Attendance %, Present, Absent).
- **Interactive Visualizations**: Weekly attendance trends (Area Chart) and subject-wise averages (Bar Chart) powered by Recharts.
- **Dynamic QR Code Generator**: Creates cryptographically randomized tokens (`crypto.getRandomValues`) with customizable expiry durations (5 to 60 minutes).
- **Live Classroom Projector Screen**: High-resolution QR code, live visual countdown timer, and a real-time attendee feed updating as students scan.
- **Session Control**: Manually terminate/close sessions at any time to immediately cut off submissions.
- **Attendance Management & Reports**: Comprehensive table with instant search (student name, roll number, subject), filter by class and status, sortable columns, and **1-click CSV Export**.

### 👨‍🎓 Student Portal
- **Student Dashboard**: Live overall attendance percentage, eligibility status indicator (75% threshold), classes attended, and missed lecture counter.
- **In-Browser QR Scanner**: Powered by `html5-qrcode`. Supports rear camera on smartphones and webcams on laptops, with smooth viewfinder animation and laser guide.
- **Manual Token Fallback**: Allows students on devices without cameras or with permissions disabled to input tokens or links directly.
- **Instant Celebratory Feedback**: Confetti animation on successful verification.
- **Personal Attendance History**: Chronological log of all marked classes with status badges and CSV download.

### 🛡️ Security & Integrity Engine
- **Duplicate Prevention**: Client-side and database-level unique constraints (`unique_student_session` on `(student_id, session_id)`) reject duplicate scans.
- **Auto-Expiry Enforcement**: Sessions and QR tokens automatically become invalid after the configured duration.
- **State Validation**: Closed sessions are immediately blocked from accepting new attendance entries.
- **Supabase Row Level Security (RLS)**: Enforces role-based permissions at the PostgreSQL layer.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS, React Router v6, Lucide React icons
- **Backend / Database**: Supabase PostgreSQL, Supabase Authentication, Row Level Security (RLS), Stored Procedures
- **Libraries**:
  - `qrcode.react`: High-density SVG QR code rendering
  - `html5-qrcode`: Cross-platform in-browser camera scanning
  - `recharts`: Responsive statistical dashboards
  - `date-fns`: Date, time, and relative duration calculations
  - `canvas-confetti`: Celebratory visual feedback on verified attendance

---

## 📁 Project Structure

```
smartattend/
├── .env.example                     # Environment variables template
├── index.html                       # HTML root with Plus Jakarta Sans typography
├── package.json                     # Project dependencies & scripts
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind custom color palette & styling
├── vite.config.js                   # Vite bundler configuration
├── supabase/
│   └── schema.sql                   # Supabase PostgreSQL schema, RLS policies & seed data
└── src/
    ├── assets/                      # Static assets & logos
    ├── components/
    │   ├── common/                  # Reusable UI primitives (Button, Badge, Modal, StatCard, etc.)
    │   ├── teacher/                 # Teacher components (QRCodeDisplay, LiveAttendanceFeed, AttendanceTable)
    │   └── student/                 # Student components (ScannerModal, etc.)
    ├── context/
    │   ├── AuthContext.jsx          # Role-based auth (Teacher, Student, Demo Switcher)
    │   ├── AttendanceContext.jsx    # Sessions & live attendance state management
    │   └── ToastContext.jsx         # Custom notifications (Success, Error, Warning, Info)
    ├── hooks/
    │   └── useCountdown.js          # Precision real-time session expiry countdown
    ├── layouts/
    │   ├── AppLayout.jsx            # Authenticated layout with Navbar and Sidebar
    │   └── AuthLayout.jsx           # Clean authentication layout
    ├── lib/
    │   └── supabase.js              # Supabase client initialization & connection checks
    ├── pages/
    │   ├── LandingPage.jsx          # SaaS landing page with architecture highlights
    │   ├── LoginPage.jsx            # Multi-role login with 1-click evaluation shortcuts
    │   ├── NotFoundPage.jsx         # 404 handler
    │   ├── teacher/                 # Teacher dashboard, create session, live QR, reports
    │   └── student/                 # Student dashboard, scanner, attendance history
    ├── services/
    │   ├── attendanceService.js     # Unified API service (Supabase DB + Local Reactive State)
    │   └── mockData.js              # Initial demonstration dataset
    └── utils/
        ├── exportCsv.js             # Formatted CSV exporter
        ├── formatters.js            # Date & duration formatting utilities
        └── tokenGenerator.js        # Cryptographic session token generator
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**

### 2. Installation
```bash
# Clone the repository and navigate into folder
cd "anti test"

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

If connecting your live Supabase project:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
> **Note**: If Supabase credentials are not provided, SmartAttend seamlessly defaults to the pre-seeded **Demo State Engine**. All actions (generating QR codes, scanning, duplicate rejection, timer countdown, CSV export) are 100% functional and interactive!

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Demonstration & Test Scenarios

The system includes pre-seeded fictional students and sample class sessions to demonstrate real-time attendance:

### Fictional Student Roster:
1. **Rahul Sharma** — Roll #`101` (`rahul@student.edu`)
2. **Arjun Verma** — Roll #`102` (`arjun@student.edu`)
3. **Priya Patel** — Roll #`103` (`priya@student.edu`)
4. **Sneha Reddy** — Roll #`104` (`sneha@student.edu`)
5. **Kiran Nair** — Roll #`105` (`kiran@student.edu`)

### Faculty Account:
- **Dr. Sarah Jenkins** — `teacher@smartattend.edu`

---

### 🔍 Verification Tests to Perform:

#### 1. Successful Attendance Marking:
1. Log in as **Dr. Sarah Jenkins** (Teacher). Click **Create Session** and generate an active QR code.
2. In the sidebar or login page, switch to **Arjun Verma (#102)** or **Sneha Reddy (#104)**.
3. Navigate to **Scan QR Code** and scan the QR code (or click the quick-test token **"1. Valid QR"**).
4. 🎉 **Result**: Confetti triggers, status changes to "Attendance Verified!", and the record immediately appears on the teacher's live attendee feed.

#### 2. Duplicate Attendance Rejection:
1. While logged in as **Rahul (#101)** or **Priya (#103)** (who already checked into the live session), scan the active QR code again.
2. ⚠️ **Result**: Rejection modal/alert displays:
   > *"Duplicate submission rejected! Your attendance for this session was already recorded at [Time]."*

#### 3. Expired QR Rejection:
1. In the student scanner, scan an expired token (or click quick-test token **"3. Expired QR"**).
2. ❌ **Result**: Rejection alert displays:
   > *"This QR code has expired. Expired submissions are strictly rejected."*

---

## 🗄️ Supabase PostgreSQL Schema & RLS Setup

To deploy the schema to your Supabase instance:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor**.
3. Copy and run the SQL code from [`supabase/schema.sql`](./supabase/schema.sql).

### Key SQL Components Included:
- **`teachers` table**: Stores faculty profile information.
- **`students` table**: Stores student records, roll numbers, and assigned classes.
- **`sessions` table**: Tracks generated QR sessions, expiry timestamps, and active status.
- **`attendance` table**: Records student check-ins with foreign keys and a `UNIQUE(student_id, session_id)` constraint.
- **Row Level Security (RLS)**: Enforces read/write access policies for authenticated students and teachers.
- **`mark_qr_attendance()` Stored Procedure**: Performs server-side cryptographic token validation, expiration check, duplicate detection, and atomic insertion.

---

## 📄 License
MIT License. Built for hackathon demonstration.
