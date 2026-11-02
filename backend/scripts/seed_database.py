"""
Database seeding script for production-ready data.

Usage:
    python scripts/seed_database.py
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.scholarships.models import Scholarship
from apps.universities.models import University
from apps.destinations.models import Destination
from apps.accounts.models import User


def create_scholarships():
    """Create real scholarship records."""
    print("Creating scholarships...")
    
    scholarships_data = [
        {
            'name': 'Fulbright Foreign Student Program',
            'provider': 'U.S. Department of State',
            'country': 'United States',
            'type': 'FULL',
            'level': 'GRADUATE',
            'amount': 50000,
            'amount_type': 'Full Tuition + Living Expenses',
            'description': 'The Fulbright Program provides funding for graduate students, young professionals and artists from abroad to study and conduct research in the United States. The program covers tuition, airfare, living stipend, and health insurance.',
            'short_description': 'Prestigious fully-funded scholarship for international graduate students in the USA.',
            'eligibility': [
                'Open to international students',
                'Graduate degree program',
                'Strong academic record',
                'English proficiency required',
                'Must return to home country after completion'
            ],
            'fields': ['All Fields'],
            'target_countries': [],
            'application_deadline': datetime(2025, 10, 15),
            'documents_required': [
                'Academic transcripts',
                'Three letters of recommendation',
                'Personal statement',
                'TOEFL/IELTS scores',
                'Research proposal (if applicable)'
            ],
            'benefits': [
                'Full tuition coverage',
                'Monthly stipend ($2,500-$3,000)',
                'Health insurance',
                'Round-trip airfare',
                'Professional development opportunities'
            ],
            'status': 'OPEN',
            'is_featured': True,
            'is_popular': True,
            'website_url': 'https://foreign.fulbrightonline.org',
            'application_url': 'https://foreign.fulbrightonline.org/apply',
        },
        {
            'name': 'Chevening Scholarships',
            'provider': 'UK Government',
            'country': 'United Kingdom',
            'type': 'FULL',
            'level': 'GRADUATE',
            'amount': 40000,
            'amount_type': 'Full Tuition + Living Allowance',
            'description': 'Chevening Scholarships enable outstanding emerging leaders from all over the world to pursue one-year master\'s degrees in the UK. Scholars receive full financial support and access to exclusive networking opportunities.',
            'short_description': 'UK government scholarship for future leaders pursuing master\'s degrees.',
            'eligibility': [
                'Minimum 2 years work experience',
                'Demonstrated leadership potential',
                'Bachelor\'s degree (upper second-class honors)',
                'Meet English language requirements',
                'Return to home country for minimum 2 years'
            ],
            'fields': ['All Fields'],
            'target_countries': [],
            'application_deadline': datetime(2025, 11, 1),
            'documents_required': [
                'Work experience evidence',
                'Degree certificate and transcripts',
                'IELTS/TOEFL scores',
                'Two reference letters',
                'Leadership and networking essays'
            ],
            'benefits': [
                'Full tuition fees',
                'Monthly living allowance (£1,347)',
                'Return airfare',
                'Arrival allowance',
                'Thesis/dissertation grant',
                'Access to exclusive events'
            ],
            'status': 'OPEN',
            'is_featured': True,
            'is_popular': True,
            'website_url': 'https://www.chevening.org',
            'application_url': 'https://www.chevening.org/apply',
        },
        {
            'name': 'DAAD Scholarships',
            'provider': 'German Academic Exchange Service',
            'country': 'Germany',
            'type': 'FULL',
            'level': 'GRADUATE',
            'amount': 30000,
            'amount_type': '€934 per month + health insurance',
            'description': 'DAAD offers scholarships for international students to pursue master\'s and PhD programs in Germany. The scholarship supports study, research, and professional development at German institutions.',
            'short_description': 'German government scholarship for graduate studies in Germany.',
            'eligibility': [
                'Bachelor\'s degree completed within last 6 years',
                'German or English language proficiency',
                'Good to excellent academic record',
                'Clear motivation for studying in Germany'
            ],
            'fields': [
                'Engineering',
                'Natural Sciences',
                'Mathematics',
                'Medicine',
                'Social Sciences',
                'Arts'
            ],
            'target_countries': [],
            'application_deadline': datetime(2025, 9, 30),
            'documents_required': [
                'CV in tabular form',
                'Motivation letter',
                'Academic transcripts',
                'Language certificate (German/English)',
                'Letter of admission (if available)',
                'Two reference letters'
            ],
            'benefits': [
                'Monthly stipend (€934 for graduates)',
                'Health insurance subsidy',
                'Travel allowance',
                'Study and research allowance'
            ],
            'status': 'OPEN',
            'is_featured': True,
            'is_popular': True,
            'website_url': 'https://www.daad.de',
            'application_url': 'https://www.daad.de/en/study-and-research-in-germany/scholarships',
        },
        {
            'name': 'Australia Awards Scholarships',
            'provider': 'Australian Government',
            'country': 'Australia',
            'type': 'FULL',
            'level': 'GRADUATE',
            'amount': 45000,
            'amount_type': 'Full Tuition + Living Allowance',
            'description': 'Australia Awards offer opportunities for people from developing countries to undertake full-time undergraduate or postgraduate study at participating Australian universities and Technical and Further Education (TAFE) institutions.',
            'short_description': 'Australian government scholarship for students from developing countries.',
            'eligibility': [
                'From eligible developing country',
                'Meet Australia\'s health requirements',
                'Commit to returning home after study',
                'Not be married to or engaged to an Australian citizen'
            ],
            'fields': ['All Fields'],
            'target_countries': [
                'Countries in Africa, Asia, Pacific, Caribbean'
            ],
            'application_deadline': datetime(2025, 4, 30),
            'documents_required': [
                'Completed application form',
                'Academic records and certificates',
                'IELTS/TOEFL scores',
                'Medical certificate',
                'Two referee reports',
                'Development impact statement'
            ],
            'benefits': [
                'Full tuition fees',
                'Return air travel',
                'Establishment allowance',
                'Living allowance (fortnightly)',
                'Overseas Student Health Cover',
                'Supplementary academic support'
            ],
            'status': 'OPEN',
            'is_featured': True,
            'is_popular': False,
            'website_url': 'https://www.dfat.gov.au/people-to-people/australia-awards',
            'application_url': 'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships',
        },
    ]
    
    for data in scholarships_data:
        scholarship, created = Scholarship.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"  ✓ Created: {scholarship.name}")
        else:
            print(f"  - Already exists: {scholarship.name}")
    
    print(f"Scholarships created: {Scholarship.objects.count()}")


def create_universities():
    """Create real university records."""
    print("\nCreating universities...")
    
    universities_data = [
        {
            'name': 'Harvard University',
            'country': 'United States',
            'city': 'Cambridge, Massachusetts',
            'type': 'PRIVATE',
            'founded_year': 1636,
            'description': 'Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Established in 1636 and named for its first benefactor, clergyman John Harvard, Harvard is the oldest institution of higher learning in the United States and among the most prestigious in the world.',
            'world_ranking': 1,
            'national_ranking': 1,
            'total_students': 23000,
            'international_students': 5700,
            'acceptance_rate': 3.4,
            'tuition_fee': 57261,
            'application_fee': 85,
            'programs': [
                'Arts and Sciences',
                'Business Administration',
                'Design',
                'Divinity',
                'Education',
                'Engineering and Applied Sciences',
                'Government',
                'Law',
                'Medicine',
                'Public Health'
            ],
            'popular_majors': [
                'Economics',
                'Computer Science',
                'Political Science',
                'Psychology',
                'Biology'
            ],
            'required_tests': ['SAT/ACT', 'TOEFL/IELTS/Duolingo'],
            'minimum_gpa': 3.9,
            'website_url': 'https://www.harvard.edu',
            'admissions_email': 'college@fas.harvard.edu',
            'is_featured': True,
            'is_partner': False,
        },
        {
            'name': 'University of Oxford',
            'country': 'United Kingdom',
            'city': 'Oxford',
            'type': 'PUBLIC',
            'founded_year': 1096,
            'description': 'The University of Oxford is a collegiate research university in Oxford, England. There is evidence of teaching as early as 1096, making it the oldest university in the English-speaking world and the world\'s second-oldest university in continuous operation.',
            'world_ranking': 2,
            'national_ranking': 1,
            'total_students': 24515,
            'international_students': 9500,
            'acceptance_rate': 17.5,
            'tuition_fee': 33050,
            'application_fee': 0,
            'programs': [
                'Humanities',
                'Medical Sciences',
                'Mathematical, Physical and Life Sciences',
                'Social Sciences',
                'Continuing Education'
            ],
            'popular_majors': [
                'Philosophy, Politics and Economics (PPE)',
                'Medicine',
                'Law',
                'Engineering Science',
                'Mathematics'
            ],
            'required_tests': ['IELTS/TOEFL', 'Subject-specific tests'],
            'minimum_gpa': 3.7,
            'website_url': 'https://www.ox.ac.uk',
            'admissions_email': 'undergraduate.admissions@admin.ox.ac.uk',
            'is_featured': True,
            'is_partner': False,
        },
        {
            'name': 'Stanford University',
            'country': 'United States',
            'city': 'Stanford, California',
            'type': 'PRIVATE',
            'founded_year': 1885,
            'description': 'Stanford University, officially Leland Stanford Junior University, is a private research university in Stanford, California. The campus occupies 8,180 acres, among the largest in the United States, and enrolls over 17,000 students.',
            'world_ranking': 3,
            'national_ranking': 2,
            'total_students': 17249,
            'international_students': 3879,
            'acceptance_rate': 3.7,
            'tuition_fee': 61731,
            'application_fee': 90,
            'programs': [
                'Business',
                'Earth Sciences',
                'Education',
                'Engineering',
                'Humanities and Sciences',
                'Law',
                'Medicine'
            ],
            'popular_majors': [
                'Computer Science',
                'Engineering',
                'Biology',
                'Economics',
                'Psychology'
            ],
            'required_tests': ['SAT/ACT (optional)', 'TOEFL/IELTS/Duolingo'],
            'minimum_gpa': 3.9,
            'website_url': 'https://www.stanford.edu',
            'admissions_email': 'admission@stanford.edu',
            'is_featured': True,
            'is_partner': False,
        },
    ]
    
    for data in universities_data:
        university, created = University.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"  ✓ Created: {university.name}")
        else:
            print(f"  - Already exists: {university.name}")
    
    print(f"Universities created: {University.objects.count()}")


def create_destinations():
    """Create real destination records."""
    print("\nCreating destinations...")
    
    destinations_data = [
        {
            'name': 'United States',
            'flag_emoji': '🇺🇸',
            'description': 'The United States hosts the largest number of international students worldwide. With over 4,000 accredited institutions, the US offers unparalleled diversity in programs, cutting-edge research facilities, and opportunities for practical training through OPT and CPT programs.',
            'total_universities': 4000,
            'international_students': 1000000,
            'popularity_rank': 1,
            'is_popular': True,
            'is_featured': True,
            'education_quality_rating': 4.8,
            'average_tuition_fee': 35000,
            'average_living_cost': 1500,
            'work_while_studying': True,
            'work_hours_per_week': 20,
            'post_study_work_visa': True,
            'post_study_work_duration': '12-36 months (OPT, 36 months for STEM)',
            'primary_language': 'English',
            'english_required': True,
            'required_tests': ['TOEFL', 'IELTS', 'Duolingo English Test'],
            'visa_approval_rate': 75.5,
            'visa_processing_time': '4-6 weeks',
            'highlights': [
                'World\'s top-ranked universities',
                'Diverse range of programs and specializations',
                'Optional Practical Training (OPT) up to 3 years',
                'Strong job market and internship opportunities',
                'Multicultural environment with global networking'
            ],
            'scholarship_availability': 'Extensive scholarships including Fulbright, university-specific aid, and assistantships',
            'official_education_website': 'https://www.educationusa.state.gov',
        },
        {
            'name': 'United Kingdom',
            'flag_emoji': '🇬🇧',
            'description': 'The UK is home to some of the world\'s oldest and most prestigious universities including Oxford and Cambridge. Known for shorter degree durations (3-year bachelor\'s, 1-year master\'s), the UK offers quality education with strong global recognition and the new Graduate Route visa.',
            'total_universities': 160,
            'international_students': 679970,
            'popularity_rank': 2,
            'is_popular': True,
            'is_featured': True,
            'education_quality_rating': 4.7,
            'average_tuition_fee': 26000,
            'average_living_cost': 1300,
            'work_while_studying': True,
            'work_hours_per_week': 20,
            'post_study_work_visa': True,
            'post_study_work_duration': '2 years (3 years for PhD) - Graduate Route',
            'primary_language': 'English',
            'english_required': True,
            'required_tests': ['IELTS', 'TOEFL', 'PTE'],
            'visa_approval_rate': 85.0,
            'visa_processing_time': '3-4 weeks',
            'highlights': [
                'Historic universities with global reputation',
                'Shorter degree programs (save time and money)',
                'Graduate Route visa for 2-3 years work',
                'Strong research opportunities',
                'Gateway to Europe'
            ],
            'scholarship_availability': 'Chevening, Commonwealth Scholarships, GREAT Scholarships, and university-specific funding',
            'official_education_website': 'https://study-uk.britishcouncil.org',
        },
        {
            'name': 'Canada',
            'flag_emoji': '🇨🇦',
            'description': 'Canada offers high-quality education at comparatively affordable costs, with clear pathways to permanent residency. Known for its welcoming immigration policies, safe cities, and multicultural society, Canada has become increasingly popular among international students.',
            'total_universities': 100,
            'international_students': 807750,
            'popularity_rank': 3,
            'is_popular': True,
            'is_featured': True,
            'education_quality_rating': 4.6,
            'average_tuition_fee': 22500,
            'average_living_cost': 1100,
            'work_while_studying': True,
            'work_hours_per_week': 20,
            'post_study_work_visa': True,
            'post_study_work_duration': 'Up to 3 years (Post-Graduation Work Permit)',
            'primary_language': 'English/French',
            'english_required': True,
            'required_tests': ['IELTS', 'TOEFL', 'CAEL', 'PTE'],
            'visa_approval_rate': 82.0,
            'visa_processing_time': '4-8 weeks',
            'highlights': [
                'Affordable tuition compared to US and UK',
                'Clear pathway to permanent residency',
                'Safe and multicultural cities',
                'Post-graduation work permit up to 3 years',
                'Co-op programs with paid work experience'
            ],
            'scholarship_availability': 'Various scholarships including Vanier CGS, Trudeau Foundation, and provincial awards',
            'official_education_website': 'https://www.educanada.ca',
        },
        {
            'name': 'Australia',
            'flag_emoji': '🇦🇺',
            'description': 'Australia combines world-class education with excellent quality of life and sunny climate. With 7 of the top 100 universities globally, Australia offers strong programs especially in engineering, sciences, and business, along with generous work rights for international students.',
            'total_universities': 43,
            'international_students': 624000,
            'popularity_rank': 4,
            'is_popular': True,
            'is_featured': True,
            'education_quality_rating': 4.5,
            'average_tuition_fee': 30000,
            'average_living_cost': 1500,
            'work_while_studying': True,
            'work_hours_per_week': 48,
            'post_study_work_visa': True,
            'post_study_work_duration': '2-4 years (Temporary Graduate visa)',
            'primary_language': 'English',
            'english_required': True,
            'required_tests': ['IELTS', 'TOEFL', 'PTE', 'Cambridge English'],
            'visa_approval_rate': 84.5,
            'visa_processing_time': '4-6 weeks',
            'highlights': [
                'High standard of living and safety',
                'Excellent climate and outdoor lifestyle',
                'Strong economy with good job prospects',
                '48 hours/fortnight work rights while studying',
                'Pathway to permanent residency'
            ],
            'scholarship_availability': 'Australia Awards, Destination Australia, university scholarships, and research stipends',
            'official_education_website': 'https://www.studyinaustralia.gov.au',
        },
    ]
    
    for data in destinations_data:
        destination, created = Destination.objects.get_or_create(
            name=data['name'],
            defaults=data
        )
        if created:
            print(f"  ✓ Created: {destination.name}")
        else:
            print(f"  - Already exists: {destination.name}")
    
    print(f"Destinations created: {Destination.objects.count()}")


def create_admin_user():
    """Create admin user for platform management."""
    print("\nCreating admin user...")
    
    if not User.objects.filter(email='admin@goferexam.com').exists():
        admin = User.objects.create_superuser(
            email='admin@goferexam.com',
            password='changeme123',  # CHANGE THIS IMMEDIATELY
            first_name='Admin',
            last_name='User'
        )
        print(f"  ✓ Created admin: {admin.email}")
        print(f"  ⚠️  IMPORTANT: Change password immediately after first login!")
    else:
        print(f"  - Admin already exists")


def main():
    """Main seeding function."""
    print("=" * 60)
    print("GOFER EXAM - Production Database Seeding")
    print("=" * 60)
    print()
    
    try:
        create_admin_user()
        create_scholarships()
        create_universities()
        create_destinations()
        
        print()
        print("=" * 60)
        print("✅ Database seeding completed successfully!")
        print("=" * 60)
        print()
        print("Admin credentials:")
        print("  Email:    admin@goferexam.com")
        print("  Password: changeme123")
        print()
        print("⚠️  SECURITY: Change admin password immediately!")
        print("   python manage.py changepassword admin@goferexam.com")
        print()
        print("Data seeded:")
        print(f"  • {Scholarship.objects.count()} scholarships")
        print(f"  • {University.objects.count()} universities")
        print(f"  • {Destination.objects.count()} destinations")
        print()
        
    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ Error: {str(e)}")
        print("=" * 60)
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
