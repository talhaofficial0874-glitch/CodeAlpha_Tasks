import os
import shutil
import re
import argparse
import logging
import requests
from pathlib import Path

# Set up professional logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

def move_images(source_dir: str, dest_dir: str, extension: str = ".jpg") -> None:
    """
    Move all files with a specific extension from the source to the destination directory.
    """
    source_path = Path(source_dir)
    dest_path = Path(dest_dir)

    if not source_path.exists() or not source_path.is_dir():
        logger.error(f"Source directory does not exist or is not a directory: {source_dir}")
        return

    # Create destination directory if it doesn't exist
    dest_path.mkdir(parents=True, exist_ok=True)

    moved_count = 0
    # Find all files with the specified extension in the source directory
    for file_path in source_path.glob(f"*{extension}"):
        if file_path.is_file():
            try:
                shutil.move(str(file_path), str(dest_path / file_path.name))
                logger.info(f"Moved: {file_path.name}")
                moved_count += 1
            except Exception as e:
                logger.error(f"Failed to move {file_path.name}: {e}")

    logger.info(f"Total '{extension}' files moved: {moved_count}")

def extract_emails(input_file: str, output_file: str) -> None:
    """
    Extract all email addresses from a text file and save them to another file.
    """
    input_path = Path(input_file)
    output_path = Path(output_file)

    if not input_path.exists() or not input_path.is_file():
        logger.error(f"Input file does not exist or is not a valid file: {input_file}")
        return

    # Robust regex pattern for matching email addresses
    email_pattern = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
    found_emails = set() # Using a set to ensure unique emails
    
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            for line in f:
                emails = email_pattern.findall(line)
                found_emails.update(emails)
                
        if not found_emails:
            logger.info("No email addresses found in the file.")
            return

        with open(output_path, 'w', encoding='utf-8') as f:
            for email in sorted(found_emails):
                f.write(f"{email}\n")
                
        logger.info(f"Extracted {len(found_emails)} unique email addresses to {output_file}")
    except Exception as e:
        logger.error(f"An error occurred while processing emails: {e}")

def scrape_title(url: str, output_file: str) -> None:
    """
    Scrape the title of a webpage and save it to a file.
    """
    try:
        logger.info(f"Fetching webpage: {url}")
        # Setting a timeout is a good practice for web requests
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        # Using regex to extract title (a lightweight alternative to BeautifulSoup for simple needs)
        title_match = re.search(r'<title>(.*?)</title>', response.text, re.IGNORECASE)
        
        if title_match:
            title = title_match.group(1).strip()
            logger.info(f"Found title: '{title}'")
            
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f"{title}\n")
            logger.info(f"Saved title to {output_file}")
        else:
            logger.warning("No <title> tag found on the provided webpage.")
            
    except requests.RequestException as e:
        logger.error(f"Failed to fetch the webpage: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")

def main():
    # Setup professional command-line interface using argparse
    parser = argparse.ArgumentParser(
        description="Professional Automation Toolkit.\nPerforms various repetitive tasks efficiently.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available automation tasks", required=True)
    
    # Task 1: Moving Images
    parser_move = subparsers.add_parser("move-images", help="Move .jpg files from one folder to another")
    parser_move.add_argument("--source", required=True, help="Source directory path")
    parser_move.add_argument("--dest", required=True, help="Destination directory path")
    
    # Task 2: Extracting Emails
    parser_emails = subparsers.add_parser("extract-emails", help="Extract all email addresses from a text file")
    parser_emails.add_argument("--input", required=True, help="Input text file path")
    parser_emails.add_argument("--output", required=True, help="Output text file path to save extracted emails")
    
    # Task 3: Scraping Webpage Title
    parser_scrape = subparsers.add_parser("scrape-title", help="Scrape the title of a webpage and save it")
    parser_scrape.add_argument("--url", required=True, help="URL of the webpage to scrape")
    parser_scrape.add_argument("--output", required=True, help="Output file path to save the title")
    
    args = parser.parse_args()
    
    # Route to the appropriate function based on the subcommand
    if args.command == "move-images":
        move_images(args.source, args.dest)
    elif args.command == "extract-emails":
        extract_emails(args.input, args.output)
    elif args.command == "scrape-title":
        scrape_title(args.url, args.output)

if __name__ == "__main__":
    main()
