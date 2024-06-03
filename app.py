from flask import Flask, render_template, request, jsonify, send_file  # Flask web framework
from concurrent.futures import ProcessPoolExecutor, as_completed  # For parallel processing
from tqdm import tqdm  # For displaying progress bars
import fitz  # PyMuPDF library for PDF handling
import re  # Regular expression module for text processing
import os  # For checking file existence
import time  # For measuring execution time
import pickle  # For saving and loading preprocessed data
import json  # For handling JSON data
import csv  # For CSV file handling

app = Flask(__name__)

# Global variables for PDF file path and index file path
PDF_FILE_PATH = 'Resources/physText.pdf'
INDEX_FILE_PATH = 'Resources/index.pkl'

# Function to extract text and sentences from a page
def extract_sentences(page_num, text):
    # Split the text into sentences using regular expressions
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', text)
    return [{'Page Number': page_num + 1, 'Sentence': sentence} for sentence in sentences]

# Pre-process the PDF to create an index and sort it by page number
def preprocess_pdf(pdf_file):
    index = []
    try:
        pdf_document = fitz.open(pdf_file)  # Open the PDF file
        total_pages = len(pdf_document)  # Get the total number of pages
        with ProcessPoolExecutor() as executor:
            futures = []
            # Display a progress bar while submitting tasks for each page
            for page_num in tqdm(range(total_pages), desc="Preprocessing PDF", unit="page"):
                future = executor.submit(extract_sentences, page_num, pdf_document.load_page(page_num).get_text("text"))
                futures.append(future)

            # Collect results as they complete
            for future in as_completed(futures):
                index.extend(future.result())
        # Sort the index by page number
        index.sort(key=lambda x: x['Page Number'])
    except Exception as e:
        print(f"An error occurred during preprocessing: {e}")
    return index

# Save the preprocessed index to a file
def save_index_to_file(index, filename):
    with open(filename, 'wb') as file:
        pickle.dump(index, file)

# Load the preprocessed index from a file
def load_index_from_file(filename):
    with open(filename, 'rb') as file:
        return pickle.load(file)

# Search for keywords in the preprocessed index
def search_keywords_in_index(index, keywords):
    all_data = []
    for entry in index:
        for keyword in keywords:
            if keyword.lower() in entry['Sentence'].lower():
                # Highlight the keyword in the sentence
                highlighted_sentence = re.sub(f"(?i)({re.escape(keyword)})", r"<b>\1</b>", entry['Sentence'], flags=re.IGNORECASE)
                all_data.append({'Keyword': keyword, 'Page Number': entry['Page Number'], 'Sentence': highlighted_sentence})
    return all_data

# Main function to search keywords in the PDF
def search_keywords_in_pdf(pdf_file, keywords):
    if not os.path.isfile(pdf_file):
        print("No such file:", os.path.basename(pdf_file))
        return [], 0.0
    
    start_time = time.time()  # Start measuring time

    # Check if the index file already exists
    if os.path.isfile(INDEX_FILE_PATH):
        index = load_index_from_file(INDEX_FILE_PATH)  # Load the index if it exists
    else:
        index = preprocess_pdf(pdf_file)  # Preprocess the PDF to create an index
        save_index_to_file(index, INDEX_FILE_PATH)  # Save the index to a file
    
    found_data = search_keywords_in_index(index, keywords)  # Search for keywords in the index
    
    end_time = time.time()  # End measuring time
    duration = end_time - start_time  # Calculate the duration
    
    return found_data, duration

# Initialization function to preprocess the PDF and save the index
def initialize_index(pdf_file, index_file):
    print("Initializing index...")
    if not os.path.isfile(index_file):
        index = preprocess_pdf(pdf_file)  # Preprocess the PDF if the index file doesn't exist
        save_index_to_file(index, index_file)  # Save the index to a file
        print("PDF preprocessing complete and index saved.")
    else:
        print("Index file already exists. Skipping preprocessing.")

# Route to handle Trible Knowledge submission
@app.route('/submit_problem', methods=['POST'])
def submit_problem():
    data = request.form  # Get form data
    name = data['name']
    problem_description = data['problem-description']
    solution = data['solution']
    
    # Path to the CSV file
    csv_file_path = 'data/tribleKnowledge/tkData.csv'
    
    # Check if CSV file exists, if not, create it and write header
    if not os.path.isfile(csv_file_path):
        with open(csv_file_path, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Name', 'Problem Description', 'Solution'])  # Write header
    
    # Write form data to CSV file
    with open(csv_file_path, 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([name, problem_description, solution])
    
    return jsonify({'message': 'Data submitted successfully'})

# Route to render the index page
@app.route('/')
def index():
    return render_template('index.html')

# Route to handle search requests
@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()  # Get JSON data from the request
    keywords = data['keywords']
    found_data, duration = search_keywords_in_pdf(PDF_FILE_PATH, keywords)  # Perform the search
    response = {
        'results': found_data,
        'duration': duration,
        'num_results': len(found_data)
    }
    return jsonify(response)

# Route to view the PDF
@app.route('/view_pdf')
def view_pdf():
    page_number = request.args.get('page')
    return send_file(PDF_FILE_PATH)

if __name__ == '__main__':
    # Initialize the index
    initialize_index(PDF_FILE_PATH, INDEX_FILE_PATH)
    
    # Start the Flask application
    app.run(debug=True)
