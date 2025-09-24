#!/usr/bin/env python3
"""
Test Grant Data Generator

Creates sample grant data for testing the application functionality.
"""

import json
from datetime import datetime, timedelta
import random

def generate_test_grants():
    """Generate realistic test grant data for First Nations programs"""
    
    test_grants = [
        {
            "title": "Indigenous Community Infrastructure Program",
            "description": "Funding to support infrastructure development in First Nations communities, including water treatment facilities, community centers, and housing projects. This program aims to improve quality of life and economic opportunities.",
            "agency": "Indigenous Services Canada",
            "program": "Infrastructure and Housing",
            "category": "Housing",
            "eligibility": "First Nations communities with demonstrated infrastructure needs. Must provide matching funds of 10%. Priority given to projects addressing water, housing, or community facilities.",
            "application_link": "https://www.sac-isc.gc.ca/eng/apply/infrastructure",
            "deadline": "2024-12-15",
            "amount": "$2,500,000",
            "currency": "CAD",
            "status": "active",
            "source_url": "https://www.sac-isc.gc.ca/eng/infrastructure-program",
            "scraped_at": datetime.now().isoformat(),
        },
        {
            "title": "First Nations Economic Development Fund",
            "description": "Supports business development and entrepreneurship in Indigenous communities. Provides capital for start-ups, business expansion, and skills training programs.",
            "agency": "Crown-Indigenous Relations and Northern Affairs",
            "program": "Economic Development",
            "category": "Economic Development",
            "eligibility": "First Nations individuals and communities. Must demonstrate viable business plan and community benefit. Preference for projects creating local employment.",
            "application_link": "https://www.rcaanc-cirnac.gc.ca/eng/apply/economic",
            "deadline": "2024-11-30",
            "amount": "$500,000",
            "currency": "CAD",
            "status": "active",
            "source_url": "https://www.rcaanc-cirnac.gc.ca/eng/economic-development",
            "scraped_at": datetime.now().isoformat(),
        },
        {
            "title": "Indigenous Languages Preservation Initiative",
            "description": "Funding for programs that preserve, revitalize, and promote Indigenous languages through education, digital resources, and community programming.",
            "agency": "Canadian Heritage",
            "program": "Indigenous Languages",
            "category": "Culture and Language",
            "eligibility": "Indigenous communities, language keepers, and educational institutions. Must demonstrate connection to traditional language preservation.",
            "application_link": "https://www.canada.ca/en/heritage/apply/languages",
            "deadline": "2024-10-31",
            "amount": "$150,000",
            "currency": "CAD",
            "status": "active",
            "source_url": "https://www.canada.ca/en/heritage/indigenous-languages",
            "scraped_at": datetime.now().isoformat(),
        },
        {
            "title": "Indigenous Health Innovation Program",
            "description": "Supports innovative health programs addressing unique challenges in First Nations communities, including mental health, traditional healing, and telemedicine initiatives.",
            "agency": "Health Canada",
            "program": "First Nations Health",
            "category": "Health",
            "eligibility": "First Nations health authorities and communities. Must address specific health outcomes and include evaluation metrics.",
            "application_link": "https://www.canada.ca/en/health-canada/apply/indigenous-health",
            "deadline": "2025-01-15",
            "amount": "$750,000",
            "currency": "CAD",
            "status": "active",
            "source_url": "https://www.canada.ca/en/health-canada/indigenous-innovation",
            "scraped_at": datetime.now().isoformat(),
        },
        {
            "title": "Youth Education Scholarship Program",
            "description": "Provides scholarships and bursaries for First Nations youth pursuing post-secondary education, including trade programs, college, and university degrees.",
            "agency": "Indigenous Services Canada",
            "program": "Education Support",
            "category": "Education",
            "eligibility": "First Nations youth enrolled in recognized post-secondary programs. Must maintain minimum GPA and demonstrate community involvement.",
            "application_link": "https://www.sac-isc.gc.ca/eng/apply/education",
            "deadline": "2024-09-30",
            "amount": "$25,000",
            "currency": "CAD",
            "status": "active",
            "source_url": "https://www.sac-isc.gc.ca/eng/education-scholarships",
            "scraped_at": datetime.now().isoformat(),
        },
        {
            "title": "Clean Energy Transition Fund",
            "description": "Supports First Nations communities in implementing renewable energy projects, including solar, wind, and hydro installations for community energy independence.",
            "agency": "Natural Resources Canada",
            "program": "Clean Energy",
            "category": "Environment",
            "eligibility": "First Nations communities interested in renewable energy projects. Must provide feasibility studies and environmental assessments.",
            "application_link": "https://www.nrcan-rncan.gc.ca/apply/clean-energy",
            "deadline": "2024-12-01",
            "amount": "$3,000,000",
            "currency": "CAD",
            "status": "active",
            "source_url": "https://www.nrcan-rncan.gc.ca/clean-energy-indigenous",
            "scraped_at": datetime.now().isoformat(),
        }
    ]
    
    return test_grants

def main():
    """Generate and save test grant data"""
    print("Generating test grant data...")
    
    grants = generate_test_grants()
    
    # Save to JSON file
    with open("discovered_grants.json", 'w', encoding='utf-8') as f:
        json.dump(grants, f, indent=2, ensure_ascii=False)
    
    print(f"Generated {len(grants)} test grants and saved to discovered_grants.json")
    
    # Display summary
    print("\nGenerated grants:")
    for grant in grants:
        print(f"  - {grant['title']} ({grant['agency']}) - ${grant['amount']}")

if __name__ == "__main__":
    main()