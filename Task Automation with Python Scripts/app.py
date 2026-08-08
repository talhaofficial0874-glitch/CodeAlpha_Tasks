import os
import shutil
import re
import requests
from pathlib import Path
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/move-images', methods=['POST'])
def move_images():
    data = request.json
    source_dir = data.get('source')
    dest_dir = data.get('dest')
    extension = data.get('extension', '.jpg')

    if not source_dir or not dest_dir:
        return jsonify({'success': False, 'message': 'Source and destination are required.'}), 400

    source_path = Path(source_dir)
    dest_path = Path(dest_dir)

    if not source_path.exists() or not source_path.is_dir():
        return jsonify({'success': False, 'message': f'Source directory does not exist: {source_dir}'}), 400

    try:
        dest_path.mkdir(parents=True, exist_ok=True)
        moved_count = 0
        for file_path in source_path.glob(f"*{extension}"):
            if file_path.is_file():
                shutil.move(str(file_path), str(dest_path / file_path.name))
                moved_count += 1

        return jsonify({'success': True, 'message': f'Successfully moved {moved_count} {extension} files!'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error moving files: {str(e)}'}), 500

@app.route('/api/extract-emails', methods=['POST'])
def extract_emails():
    data = request.json
    input_file = data.get('input')
    output_file = data.get('output')

    if not input_file or not output_file:
        return jsonify({'success': False, 'message': 'Input and output files are required.'}), 400

    input_path = Path(input_file)
    output_path = Path(output_file)

    if not input_path.exists() or not input_path.is_file():
        return jsonify({'success': False, 'message': f'Input file does not exist: {input_file}'}), 400

    email_pattern = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
    found_emails = set()
    
    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            for line in f:
                emails = email_pattern.findall(line)
                found_emails.update(emails)
                
        if not found_emails:
            return jsonify({'success': True, 'message': 'No email addresses found in the file.'})

        with open(output_path, 'w', encoding='utf-8') as f:
            for email in sorted(found_emails):
                f.write(f"{email}\n")
                
        return jsonify({'success': True, 'message': f'Extracted {len(found_emails)} unique emails to {output_file}'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error extracting emails: {str(e)}'}), 500

@app.route('/api/scrape-title', methods=['POST'])
def scrape_title():
    data = request.json
    url = data.get('url')
    output_file = data.get('output')

    if not url or not output_file:
        return jsonify({'success': False, 'message': 'URL and output file are required.'}), 400

    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        title_match = re.search(r'<title>(.*?)</title>', response.text, re.IGNORECASE)
        
        if title_match:
            title = title_match.group(1).strip()
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(f"{title}\n")
            return jsonify({'success': True, 'message': f"Saved title '{title}' to {output_file}"})
        else:
            return jsonify({'success': False, 'message': 'No <title> tag found on the provided webpage.'}), 404
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error scraping webpage: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
