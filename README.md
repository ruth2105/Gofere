# Gofer Exam - Complete Educational Consultancy Platform

![Gofer Exam](https://img.shields.io/badge/Gofer%20Exam-Educational%20Consultancy-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

**Learn. Prepare. Apply. Achieve.**

A study-abroad information and consultancy website with a Next.js frontend and a Django REST API. Public catalogues are API-backed; informational pages may still include clearly identified examples.

## 🌟 Features

### Current Functionality
- **📚 Scholarship Discovery**: API-backed catalogue with search, filters, and loading/error/empty states. The deployed catalogue is currently empty.
- **🌐 Opportunity Discovery**: API-backed published opportunities with search, category/country filters, deadlines, and official application links. Listings are manually reviewed before publication.
- **🌍 Study Abroad Destinations**: API-backed destination listings and detail pages with loading/error/empty states. The deployed catalogue is currently empty.
- **🎓 University Directory**: API-backed university listings and detail pages with search and loading/error/empty states. The deployed catalogue is currently empty.
- **📝 Exam Preparation**: Informational preparation pages for IELTS, TOEFL, and the Duolingo English Test; these are not practice-test products.
- **🏆 Services Catalogue**: API-backed active service listings and detail pages. The live catalogue is currently empty.

### Interactive Features
- Scholarship search and filtering by country, type, and level
- Opportunity search and filtering by category and country
- Opportunity detail pages with deadlines and official application links
- Study destination detail pages
- University directory search and detail pages
- Service catalogue search and detail pages
- Public navigation and service/contact information
- Responsive layouts (manual device/accessibility sign-off is still required)

### Account and administration status
- Student registration, login, current profile, and logout use the Django API through same-origin proxy routes. JWTs are set as HttpOnly cookies and unsafe requests require CSRF tokens.
- Password reset is not available. Student application tracking, document uploads, and consultation booking remain incomplete.
- Django Admin provides scholarship management, including draft/publish and unpublish controls.
- Django Admin provides opportunity draft, review, publish, and unpublish controls; collected records remain private until verified and linked to an opportunity or scholarship.
- The student application tracker is implemented. Consultant assigned-case and administrator aggregate dashboards are also implemented, but remain pending validation and deployment; consultant case updates are not available.
- Document uploads and consultation booking remain incomplete.

## 🛠 Tech Stack

- **Framework**: Next.js 16.4 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Utilities**: date-fns, clsx, tailwind-merge

## 📁 Project Structure

```
gofer-exam/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with Navigation & Footer
│   ├── page.tsx                 # Homepage
│   ├── scholarships/            # Scholarship pages
│   │   ├── page.tsx            # Scholarship listing
│   │   └── [id]/page.tsx       # Scholarship details
│   ├── study-abroad/            # Study destination pages
│   │   ├── page.tsx            # Destinations listing
│   │   └── [id]/page.tsx       # Destination details
│   └── exam-prep/               # Exam preparation pages
│       └── page.tsx            # Exam prep hub
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx          # Button component
│   │   ├── Input.tsx           # Input component
│   │   ├── Select.tsx          # Select component
│   │   ├── Card.tsx            # Card components
│   │   ├── Badge.tsx           # Badge component
│   │   └── Modal.tsx           # Modal component
│   └── layout/                  # Layout components
│       ├── Navigation.tsx      # Main navigation
│       └── Footer.tsx          # Footer
├── data/                        # Demo data
│   ├── scholarships.ts         # 22 scholarships
│   ├── universities.ts         # 12 universities
│   ├── destinations.ts         # 10 study destinations
│   ├── students.ts             # Student data and applications
│   ├── consultants.ts          # Consultant profiles
│   ├── testimonials.ts         # 6 success stories
│   └── exam-questions.ts       # Exam prep resources
├── types/
│   └── index.ts                # TypeScript type definitions
├── lib/
│   └── utils.ts                # Utility functions
└── tailwind.config.ts          # Tailwind configuration

```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd gofer-exam
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:3000
```

## 🚀 Deployment Preview

The Render Blueprint in `render.yaml` deploys the Next.js frontend, Django API,
and PostgreSQL database. The browser calls the API through a same-origin Next.js
rewrite configured by the server-only `API_PROXY_TARGET` variable. This keeps
the HttpOnly authentication cookies on the frontend origin and avoids exposing
JWTs to browser storage.

The included Render services use free plans for preview purposes. Free Render
web services can sleep when idle, free Postgres databases expire after 30 days,
and uploaded files are not retained across service restarts or deploys. Upgrade
to persistent paid services before relying on this deployment for production
data.

## 📄 Available Pages

### Public Pages
- Homepage (`/`)
- Scholarship catalogue and detail (`/scholarships`, `/scholarships/[id]`); real detail pages require a published API record.
- Published opportunity catalogue and detail (`/opportunities`, `/opportunities/[slug]`); unpublished or unverified collected records are not exposed by the public API.
- Study destinations (`/study-abroad`, `/study-abroad/[id]`); driven by the destination API.
- University directory (`/universities`, `/universities/[id]`); the deployed catalogue is currently empty.
- Exam preparation hub and information pages (`/exam-prep`, `/exam-prep/ielts`, `/exam-prep/toefl`, `/exam-prep/duolingo`)
- About, services, contact, FAQ, privacy, terms, and disclaimer pages.
- Student login and registration (`/student/login`, `/student/register`), authenticated profile (`/student`), and password-assistance notice (`/student/forgot-password`); password reset is not implemented.

## 🎨 Design System

### Color Palette
```typescript
Primary navy: #212844
Primary gold: #E9A323
Light background: #F0EEEF
White: #FFFFFF
```

### Typography
- Font: Geist Sans & Geist Mono
- Headings: Bold, using primary colors
- Body: Regular weight, gray-700

### Components
All UI components follow consistent patterns:
- Hover effects with transitions
- Proper focus states
- Responsive sizing
- Accessible color contrast

## 📊 Data

### Catalogue data
- Scholarship, opportunity, university, destination, and service API endpoints are available; deployed catalogue population and the current live deployment must be verified separately.
- Legacy local destination examples are not used by the live destination catalogue and are not verified current opportunities or partnerships.

## 🔐 Important Notes

### Disclaimer
Some repository fixture files contain fictional sample data and are not the live scholarship source. Scholarship records must be verified against official providers and published by an administrator before they appear publicly. The privacy and terms pages are preliminary notices and require legal review before production use.

### Ethical Considerations
- **No guaranteed outcomes**: The platform clearly states it cannot guarantee admission, scholarships, or visas
- **Transparent services**: Only active service entries maintained by Gofer Exam are shown in the public catalogue
- **Educational purpose**: Exam prep materials are for practice only

## 🔜 Future Enhancements

### Phase 1 (Partially complete; sign-off pending)
- [x] Public information pages and navigation routes
- [x] API-backed scholarship listing with search and filters
- [x] Original general-English practice quiz, deployed and verified; it is not an official test simulation
- [x] Keyboard skip link and reduced-motion preference support; broader accessibility sign-off is still pending
- [x] Responsive navigation avoids horizontal overflow at tested 390–1440px widths on the exam-prep page; site-wide and cross-browser checks remain pending
- [ ] Manual responsive, accessibility, and cross-browser sign-off
- [ ] Legal review of privacy and terms notices
- [ ] Verified real catalogue data

### Phase 2 (In progress; not signed off)
- [x] Django/PostgreSQL deployment and public scholarship, university, and destination catalogue APIs
- [x] Django Admin scholarship draft/publish controls
- [x] Registration, login, refresh, logout, and current-user backend endpoints
- [x] Connect frontend registration/login/profile/logout using HttpOnly cookie sessions and CSRF protection
- [x] Connect university and destination pages to API-backed data
- [x] Expose active services through a read-only API and connect the service pages
- [x] Student-owned application tracker with tested draft, submit, and withdraw transitions
- [ ] Create and verify maintained university/destination records through Django Admin
- [ ] Implement consultation, document, and notification workflows after confirming service policies and durable file-storage requirements
- [ ] Confirm deployed database backup and retention plan
- [ ] Verify a real admin-created published scholarship through listing and detail in production
- [ ] Verify student workflows using an authorized production student account

### Phase 3 (Started; dashboards in progress)
- [ ] Consultant workspace: read-only assigned-case API with server-side assignment scoping, search, status filtering and pagination; dashboard includes retry and filter clearing. Tests are added; validation and deployment are pending.
- [ ] Admin aggregate overview: administrator-only counts API and read-only dashboard. Tests are added; validation and deployment are pending.
- [ ] Admin panel with analytics
- [ ] Consultation booking system
- [ ] Rewards program interface
- [ ] Blog/resources section
- [ ] Email notifications
- [ ] Payment integration

### Phase 4 (AI Features)
- [ ] AI-powered university matching
- [ ] Scholarship eligibility checker
- [ ] SOP review assistant
- [ ] Interview preparation chatbot

## 📱 Telegram Bot Integration

Connect with students through the existing Telegram bot:
🔗 [@Goferexam_bot](https://t.me/Goferexam_bot)

## 🤝 Contributing

Before production use:
1. Verify and curate catalogue content using official sources
2. Complete secure frontend authentication and authorization
3. Implement and test required student/consultant workflows
4. Review privacy, terms, file handling, and data retention
5. Configure backups, monitoring, and persistent hosting

## 📜 License

This project is created for demonstration purposes. All rights reserved.

## 📞 Support

For inquiries about Gofer Exam:
- Email: info@goferexam.com
- Telegram: [@Goferexam_bot](https://t.me/Goferexam_bot)
- Location: Addis Ababa, Ethiopia

---

**Built with ❤️ by Gofer Exam Team**

*Learn. Prepare. Apply. Achieve.*
