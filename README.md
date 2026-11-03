# Gofer Exam - Complete Educational Consultancy Platform

![Gofer Exam](https://img.shields.io/badge/Gofer%20Exam-Educational%20Consultancy-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

**Learn. Prepare. Apply. Achieve.**

A comprehensive educational consultancy platform that helps students discover scholarships, prepare for English proficiency exams (IELTS, TOEFL, Duolingo), apply to universities worldwide, and receive expert visa guidance.

## 🌟 Features

### Core Functionality
- **📚 Scholarship Discovery**: Browse 20+ fully-funded and partial scholarships from around the world
- **🌍 Study Abroad Destinations**: Explore 10 top study destinations with detailed country information
- **📝 Exam Preparation**: Complete preparation modules for IELTS, TOEFL, and Duolingo English Test
- **🎓 University Database**: Access information about 12+ top universities worldwide
- **🏆 Services Showcase**: 8 comprehensive services including counseling, applications, and visa guidance

### Interactive Features
- Advanced scholarship filtering (by country, type, level, deadline)
- Study destination comparison
- Exam prep resources and practice materials
- Student testimonials and success stories
- Responsive design for all devices

### User Dashboards (Structure Created)
- **Student Portal**: Manage applications, documents, exam prep, and consultations
- **Consultant Dashboard**: Manage assigned students and applications
- **Admin Panel**: Full CRUD operations and analytics

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
│   ├── services.ts             # 8 services
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

The project includes a Render Blueprint in `render.yaml` for the Django API and
PostgreSQL database. Deploy the frontend from the repository root as a Next.js
project on Vercel.

1. Deploy the Render Blueprint and set `CORS_ALLOWED_ORIGINS` to the exact
   HTTPS origin assigned to the Vercel project (for example,
   `https://your-project.vercel.app`).
2. In Vercel, set `NEXT_PUBLIC_API_URL` to the Render API URL ending in
   `/api/v1`, then redeploy the frontend.

The included Render services use free plans for preview purposes. Free Render
web services can sleep when idle, free Postgres databases expire after 30 days,
and uploaded files are not retained across service restarts or deploys. Upgrade
to persistent paid services before relying on this deployment for production
data.

## 📄 Available Pages

### Public Pages
- ✅ **Homepage** (`/`) - Hero, services, scholarships, destinations, testimonials
- ✅ **Scholarships** (`/scholarships`) - Searchable scholarship database with filters
- ✅ **Scholarship Details** (`/scholarships/[id]`) - Individual scholarship information
- ✅ **Study Abroad** (`/study-abroad`) - Study destination listing
- ✅ **Destination Details** (`/study-abroad/[id]`) - Country-specific information
- ✅ **Exam Preparation** (`/exam-prep`) - IELTS, TOEFL, Duolingo prep hub

### Pages to Extend
- Services page (`/services`)
- Individual exam prep pages (`/exam-prep/ielts`, `/exam-prep/toefl`, `/exam-prep/duolingo`)
- About page (`/about`)
- Contact page (`/contact`)
- Student portal (`/student/*`)
- Consultant dashboard (`/consultant/*`)
- Admin dashboard (`/admin/*`)

## 🎨 Design System

### Color Palette
```typescript
Primary (Deep Navy):
- primary-900: #10243A (brand color)
- primary-600: #0047b3
- primary-50: #e6f0ff

Accent:
- accent-gold: #D4AF37
- accent-teal: #14b8a6
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

### Scholarships (22 total)
- Featured scholarships: Fulbright, Chevening, DAAD, Australia Awards, Rhodes, Gates Cambridge
- Coverage: Full and partial scholarships
- Countries: USA, UK, Canada, Australia, Germany, and more
- Levels: Undergraduate, Graduate, PhD

### Universities (12 total)
- Top-ranked institutions from USA, UK, Canada, Australia, Germany, Singapore
- Includes tuition ranges, acceptance rates, and program information

### Destinations (10 total)
- Comprehensive country guides with visa information
- Living costs, tuition ranges, and intake seasons
- Popular cities and study reasons

### Services (8 total)
- 7 services provided by Gofer Exam
- 1 referral service (Education Loans)

## 🔐 Important Notes

### Disclaimer
This is a demo platform with realistic but **fictional data**:
- All student names, consultant names, and testimonials are fictional
- Success rates and statistics are for demonstration purposes
- Real scholarship data is sourced from official providers but should be verified
- No real partnerships or affiliations are claimed

### Ethical Considerations
- **No guaranteed outcomes**: The platform clearly states it cannot guarantee admission, scholarships, or visas
- **Transparent services**: Services are clearly marked as provided by Gofer Exam or referral-based
- **Educational purpose**: Exam prep materials are for practice only

## 🔜 Future Enhancements

### Phase 1 (Foundation Complete ✅)
- [x] Homepage with all sections
- [x] Scholarship discovery and filtering
- [x] Study abroad destination guides
- [x] Exam preparation hub
- [x] Responsive design
- [x] Navigation and footer

### Phase 2 (To Implement)
- [ ] Individual exam prep modules (IELTS, TOEFL, Duolingo)
- [ ] Practice test functionality
- [ ] Student authentication and registration
- [ ] Student portal with dashboard
- [ ] Application tracking system
- [ ] Document upload functionality

### Phase 3 (Advanced)
- [ ] Consultant dashboard
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

This is a demonstration platform. For production use:
1. Replace demo data with real data sources
2. Implement authentication and authorization
3. Add database integration
4. Set up API endpoints
5. Implement payment processing
6. Add comprehensive error handling
7. Set up monitoring and analytics

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
