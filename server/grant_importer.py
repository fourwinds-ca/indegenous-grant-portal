#!/usr/bin/env python3
"""
Grant Importer Service - Imports discovered grants into the database

This service takes the output from grant_discovery.py and imports it into
the PostgreSQL database using the established schema.
"""

import json
import psycopg2
import os
import uuid
from datetime import datetime, date
from typing import List, Dict, Optional
from decimal import Decimal
import re

class GrantImporter:
    def __init__(self):
        self.db_url = os.getenv('DATABASE_URL')
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable is required")
    
    def connect_db(self):
        """Create database connection"""
        return psycopg2.connect(self.db_url)
    
    def parse_date(self, date_string: str) -> Optional[date]:
        """Parse various date formats into a date object"""
        if not date_string:
            return None
        
        # Remove common words and clean the string
        cleaned = re.sub(r'\b(deadline|due|by|on|before)\b', '', date_string, flags=re.IGNORECASE).strip()
        
        # Try different date formats
        date_formats = [
            '%B %d, %Y',    # January 15, 2024
            '%b %d, %Y',    # Jan 15, 2024
            '%Y-%m-%d',     # 2024-01-15
            '%m/%d/%Y',     # 01/15/2024
            '%d/%m/%Y',     # 15/01/2024
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(cleaned, fmt).date()
            except ValueError:
                continue
        
        return None
    
    def parse_amount(self, amount_string: str) -> Optional[Decimal]:
        """Parse funding amount string into decimal"""
        if not amount_string:
            return None
        
        # Extract numeric value
        numeric_match = re.search(r'[\d,]+(?:\.\d{2})?', amount_string)
        if not numeric_match:
            return None
        
        numeric_str = numeric_match.group().replace(',', '')
        
        try:
            amount = Decimal(numeric_str)
            
            # Handle multipliers
            if 'million' in amount_string.lower():
                amount *= 1000000
            elif 'thousand' in amount_string.lower():
                amount *= 1000
            
            return amount
        except (ValueError, TypeError):
            return None
    
    def check_existing_grant(self, conn, source_url: str, title: str) -> Optional[str]:
        """Check if a grant already exists in the database"""
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id FROM grants 
                WHERE source_url = %s OR (title = %s AND title IS NOT NULL)
                LIMIT 1
            """, (source_url, title))
            result = cur.fetchone()
            return result[0] if result else None
    
    def insert_or_update_grant(self, conn, grant_data: Dict) -> str:
        """Insert a new grant or update existing one"""
        # Check if grant already exists
        existing_id = self.check_existing_grant(
            conn, 
            grant_data.get('source_url'), 
            grant_data.get('title')
        )
        
        # Parse data
        deadline = self.parse_date(grant_data.get('deadline'))
        amount = self.parse_amount(grant_data.get('amount'))
        scraped_at = datetime.fromisoformat(grant_data.get('scraped_at', datetime.now().isoformat()))
        
        grant_values = {
            'title': grant_data.get('title', 'Untitled Grant')[:500],
            'description': grant_data.get('description', '')[:10000] if grant_data.get('description') else None,
            'agency': grant_data.get('agency', '')[:200] if grant_data.get('agency') else None,
            'program': grant_data.get('program', '')[:200] if grant_data.get('program') else None,
            'category': grant_data.get('category', 'General')[:100],
            'eligibility': grant_data.get('eligibility', '')[:10000] if grant_data.get('eligibility') else None,
            'application_link': grant_data.get('application_link', '')[:1000] if grant_data.get('application_link') else None,
            'deadline': deadline,
            'amount': amount,
            'currency': 'CAD',
            'status': 'active',
            'source_url': grant_data.get('source_url', '')[:1000],
            'scraped_at': scraped_at,
            'last_updated': datetime.now(),
        }
        
        with conn.cursor() as cur:
            if existing_id:
                # Update existing grant
                update_fields = []
                values = []
                for field, value in grant_values.items():
                    if field not in ['scraped_at']:  # Don't update original scrape time
                        update_fields.append(f"{field} = %s")
                        values.append(value)
                
                values.append(existing_id)
                
                cur.execute(f"""
                    UPDATE grants 
                    SET {', '.join(update_fields)}
                    WHERE id = %s
                """, values)
                
                return existing_id
            else:
                # Insert new grant
                grant_id = str(uuid.uuid4())
                
                fields = ['id'] + list(grant_values.keys()) + ['created_at']
                placeholders = ['%s'] * (len(fields))
                values = [grant_id] + list(grant_values.values()) + [datetime.now()]
                
                cur.execute(f"""
                    INSERT INTO grants ({', '.join(fields)})
                    VALUES ({', '.join(placeholders)})
                """, values)
                
                return grant_id
    
    def update_scraped_source(self, conn, url: str, success: bool, grants_found: int, error_message: str = None):
        """Track scraped sources"""
        domain = url.split('/')[2] if '://' in url else 'unknown'
        
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO scraped_sources (id, url, domain, last_scraped, success, grants_found, error_message)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (url) DO UPDATE SET
                    last_scraped = EXCLUDED.last_scraped,
                    success = EXCLUDED.success,
                    grants_found = EXCLUDED.grants_found,
                    error_message = EXCLUDED.error_message
            """, (
                str(uuid.uuid4()),
                url[:1000],
                domain[:200],
                datetime.now(),
                success,
                grants_found,
                error_message[:10000] if error_message else None
            ))
    
    def import_grants_from_file(self, filename: str = "discovered_grants.json") -> Dict[str, int]:
        """Import grants from JSON file into database"""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                grants = json.load(f)
        except FileNotFoundError:
            print(f"File {filename} not found. Run grant discovery first.")
            return {"imported": 0, "updated": 0, "errors": 0}
        
        imported = 0
        updated = 0
        errors = 0
        
        with self.connect_db() as conn:
            for grant_data in grants:
                try:
                    existing_id = self.check_existing_grant(
                        conn, 
                        grant_data.get('source_url'), 
                        grant_data.get('title')
                    )
                    
                    grant_id = self.insert_or_update_grant(conn, grant_data)
                    
                    if existing_id:
                        updated += 1
                        print(f"Updated grant: {grant_data.get('title', 'Untitled')[:60]}...")
                    else:
                        imported += 1
                        print(f"Imported grant: {grant_data.get('title', 'Untitled')[:60]}...")
                    
                    # Track the source
                    self.update_scraped_source(
                        conn, 
                        grant_data.get('source_url', ''), 
                        True, 
                        1
                    )
                    
                except Exception as e:
                    errors += 1
                    print(f"Error importing grant {grant_data.get('title', 'Unknown')}: {str(e)}")
                    continue
            
            conn.commit()
        
        return {"imported": imported, "updated": updated, "errors": errors}

def main():
    """Main function to import discovered grants"""
    print("Starting grant import process...")
    
    try:
        importer = GrantImporter()
        results = importer.import_grants_from_file()
        
        print(f"\nImport complete!")
        print(f"  New grants imported: {results['imported']}")
        print(f"  Existing grants updated: {results['updated']}")
        print(f"  Errors: {results['errors']}")
        
    except Exception as e:
        print(f"Import failed: {str(e)}")
        exit(1)

if __name__ == "__main__":
    main()