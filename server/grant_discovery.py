#!/usr/bin/env python3
"""
Grant Discovery Service for First Nations Grants Tracker

This service crawls Canadian government websites to discover grant opportunities
and extracts relevant information for the grants database.
"""

import trafilatura
import json
import re
import requests
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Optional, Tuple
import time

# Canadian government grant sources
GOVERNMENT_GRANT_SOURCES = [
    {
        "name": "Indigenous Services Canada",
        "urls": [
            "https://www.sac-isc.gc.ca/eng/1100100010002/1100100010021",  # Funding
            "https://www.sac-isc.gc.ca/eng/1324572639600/1324572682412",  # Grants and contributions
        ],
        "keywords": ["grant", "funding", "contribution", "program", "application", "deadline"]
    },
    {
        "name": "Canada.ca Grants and Contributions",
        "urls": [
            "https://www.canada.ca/en/government/grants-funding.html",
            "https://search.open.canada.ca/grants/"
        ],
        "keywords": ["indigenous", "first nations", "aboriginal", "metis", "inuit"]
    },
    {
        "name": "Crown-Indigenous Relations",
        "urls": [
            "https://www.rcaanc-cirnac.gc.ca/eng/1100100010002/1100100010021",
        ],
        "keywords": ["grant", "funding", "program", "application"]
    }
]

class GrantDiscoveryService:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def extract_website_content(self, url: str) -> Optional[str]:
        """Extract clean text content from a website using trafilatura"""
        try:
            downloaded = trafilatura.fetch_url(url)
            if not downloaded:
                return None
            text = trafilatura.extract(downloaded, 
                                    include_comments=False,
                                    include_tables=True,
                                    include_links=True)
            return text
        except Exception as e:
            print(f"Error extracting content from {url}: {str(e)}")
            return None
    
    def find_grant_keywords(self, text: str, keywords: List[str]) -> bool:
        """Check if text contains relevant grant keywords"""
        if not text:
            return False
        
        text_lower = text.lower()
        return any(keyword.lower() in text_lower for keyword in keywords)
    
    def extract_grant_information(self, text: str, url: str) -> Optional[Dict]:
        """Parse text content to extract grant information"""
        if not text or len(text) < 100:  # Too short to be meaningful
            return None
        
        # Basic grant information extraction using regex patterns
        grant_info = {
            "title": self.extract_title(text),
            "description": self.extract_description(text),
            "agency": self.extract_agency(text, url),
            "deadline": self.extract_deadline(text),
            "amount": self.extract_funding_amount(text),
            "eligibility": self.extract_eligibility(text),
            "application_link": self.extract_application_link(text, url),
            "source_url": url,
            "category": self.categorize_grant(text),
            "scraped_at": datetime.now().isoformat(),
        }
        
        # Only return if we found meaningful information
        if grant_info["title"] or grant_info["description"]:
            return grant_info
        
        return None
    
    def extract_title(self, text: str) -> Optional[str]:
        """Extract potential grant title from text"""
        lines = text.split('\n')
        for line in lines[:10]:  # Check first 10 lines
            line = line.strip()
            if len(line) > 20 and len(line) < 200:
                # Look for titles that contain funding/grant keywords
                if any(keyword in line.lower() for keyword in 
                      ['grant', 'funding', 'program', 'contribution', 'support']):
                    return line
        return None
    
    def extract_description(self, text: str) -> Optional[str]:
        """Extract grant description"""
        # Take first few paragraphs as description
        paragraphs = text.split('\n\n')
        description_parts = []
        
        for paragraph in paragraphs[:5]:
            paragraph = paragraph.strip()
            if len(paragraph) > 50 and len(paragraph) < 1000:
                description_parts.append(paragraph)
                if len(' '.join(description_parts)) > 500:
                    break
        
        return ' '.join(description_parts) if description_parts else None
    
    def extract_agency(self, text: str, url: str) -> Optional[str]:
        """Extract the government agency/department"""
        domain = urlparse(url).netloc.lower()
        
        # Map domains to agency names
        agency_mapping = {
            'sac-isc.gc.ca': 'Indigenous Services Canada',
            'rcaanc-cirnac.gc.ca': 'Crown-Indigenous Relations and Northern Affairs',
            'canada.ca': 'Government of Canada',
            'nrcan-rncan.gc.ca': 'Natural Resources Canada',
            'ic.gc.ca': 'Innovation, Science and Economic Development Canada',
        }
        
        for domain_part, agency in agency_mapping.items():
            if domain_part in domain:
                return agency
        
        return "Government of Canada"
    
    def extract_deadline(self, text: str) -> Optional[str]:
        """Extract application deadlines"""
        # Look for date patterns near deadline keywords
        deadline_patterns = [
            r'deadline[:\s]+([A-Za-z]+ \d{1,2}, \d{4})',
            r'due[:\s]+([A-Za-z]+ \d{1,2}, \d{4})',
            r'deadline[:\s]+(\d{4}-\d{2}-\d{2})',
            r'close[sd]?[:\s]+([A-Za-z]+ \d{1,2}, \d{4})',
        ]
        
        for pattern in deadline_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0]
        
        return None
    
    def extract_funding_amount(self, text: str) -> Optional[str]:
        """Extract funding amounts"""
        amount_patterns = [
            r'\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|thousand|CAD|USD))?',
            r'up to \$[\d,]+',
            r'maximum of \$[\d,]+',
        ]
        
        for pattern in amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Return the largest amount found
                amounts = []
                for match in matches:
                    # Extract numeric value for comparison
                    numeric = re.sub(r'[^\d.]', '', match)
                    if numeric:
                        amounts.append((float(numeric), match))
                
                if amounts:
                    return max(amounts, key=lambda x: x[0])[1]
        
        return None
    
    def extract_eligibility(self, text: str) -> Optional[str]:
        """Extract eligibility criteria"""
        eligibility_keywords = [
            'eligib', 'criteria', 'qualify', 'requirement', 'must be', 
            'first nations', 'indigenous', 'aboriginal', 'metis', 'inuit'
        ]
        
        lines = text.split('\n')
        eligibility_lines = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            if any(keyword in line.lower() for keyword in eligibility_keywords):
                # Include this line and potentially next few lines
                context_lines = [line]
                for j in range(i + 1, min(i + 4, len(lines))):
                    next_line = lines[j].strip()
                    if len(next_line) > 20 and not next_line.startswith('http'):
                        context_lines.append(next_line)
                    else:
                        break
                
                eligibility_lines.extend(context_lines)
                if len(' '.join(eligibility_lines)) > 300:
                    break
        
        return ' '.join(eligibility_lines) if eligibility_lines else None
    
    def extract_application_link(self, text: str, base_url: str) -> Optional[str]:
        """Extract application or more information links"""
        # Look for URLs in the text
        url_pattern = r'https?://[^\s<>"\]]+|www\.[^\s<>"\]]+'
        urls = re.findall(url_pattern, text)
        
        # Prioritize URLs that seem application-related
        application_keywords = ['apply', 'application', 'form', 'submit', 'portal']
        
        for url in urls:
            url_lower = url.lower()
            if any(keyword in url_lower for keyword in application_keywords):
                if not url.startswith('http'):
                    url = 'https://' + url
                return url
        
        # If no application-specific URL, return the first relevant URL
        for url in urls[:3]:  # Check first 3 URLs
            if not url.startswith('http'):
                url = 'https://' + url
            return url
        
        return base_url  # Fallback to source URL
    
    def categorize_grant(self, text: str) -> str:
        """Categorize the grant based on content"""
        text_lower = text.lower()
        
        categories = {
            'Economic Development': ['economic', 'business', 'entrepreneur', 'development', 'trade'],
            'Education': ['education', 'training', 'scholarship', 'student', 'learning'],
            'Health': ['health', 'medical', 'mental health', 'wellness', 'healthcare'],
            'Housing': ['housing', 'shelter', 'infrastructure', 'construction'],
            'Culture and Language': ['culture', 'language', 'heritage', 'traditional', 'arts'],
            'Environment': ['environment', 'climate', 'sustainability', 'conservation'],
            'Community': ['community', 'social', 'youth', 'elder', 'family']
        }
        
        for category, keywords in categories.items():
            if any(keyword in text_lower for keyword in keywords):
                return category
        
        return 'General'
    
    def discover_grants_from_sources(self) -> List[Dict]:
        """Main method to discover grants from configured sources"""
        discovered_grants = []
        
        for source in GOVERNMENT_GRANT_SOURCES:
            print(f"Scanning {source['name']}...")
            
            for url in source['urls']:
                try:
                    print(f"  Extracting content from: {url}")
                    content = self.extract_website_content(url)
                    
                    if content and self.find_grant_keywords(content, source['keywords']):
                        grant_info = self.extract_grant_information(content, url)
                        if grant_info:
                            grant_info['program'] = source['name']
                            discovered_grants.append(grant_info)
                            print(f"    ✓ Found grant: {grant_info.get('title', 'Untitled')}")
                    
                    # Be respectful with requests
                    time.sleep(2)
                    
                except Exception as e:
                    print(f"  Error processing {url}: {str(e)}")
                    continue
        
        return discovered_grants
    
    def save_grants_to_json(self, grants: List[Dict], filename: str = "discovered_grants.json"):
        """Save discovered grants to a JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(grants, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(grants)} grants to {filename}")

def main():
    """Main function to run grant discovery"""
    print("Starting First Nations Grant Discovery...")
    
    discovery_service = GrantDiscoveryService()
    grants = discovery_service.discover_grants_from_sources()
    
    if grants:
        discovery_service.save_grants_to_json(grants)
        print(f"\nDiscovery complete! Found {len(grants)} grant opportunities.")
    else:
        print("\nNo grants found. This could be due to website changes or network issues.")

if __name__ == "__main__":
    main()