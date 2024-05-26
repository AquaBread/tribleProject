from flask import Flask, render_template, request, jsonify, send_file 
import fitz  # PyMuPDF library for PDF handling
import re  # Regular expression module for text processing
import os  # For checking file existence

app = Flask(__name__)  # Initialize Flask application

# Global variable for PDF file path
PDF_FILE_PATH = 'Resources/physText.pdf'

# Searches for keywords in a PDF file using PyMuPDF for OCR.
def search_keywords_in_pdf(pdf_file, keywords):
    # Extracts sentences containing the keyword from the provided text.
    def extract_sentences_with_keyword(text, keyword, page_num):
        # Split text into sentences
        sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', text)
        sentences_with_keyword = []
        for sentence in sentences:
            if keyword.lower() in sentence.lower():
                sentences_with_keyword.append({'Keyword': keyword, 'Page Number': page_num + 1, 'Sentence': sentence})
        return sentences_with_keyword

    # List to store all data for all keywords
    all_data = []

    # Check if the file exists
    if not os.path.isfile(pdf_file):
        print("No such file:", os.path.basename(pdf_file))
        return all_data

    try:
        # Open the PDF file
        pdf_document = fitz.open(pdf_file)

        # Iterate through each keyword
        for keyword in keywords:
            # Iterate through each page in the PDF
            for page_num in range(len(pdf_document)):
                # Get the current page
                page = pdf_document.load_page(page_num)

                # Extract text using OCR
                text = page.get_text("text")

                # Check if the keyword is present in the extracted text
                if keyword.lower() in text.lower():
                    sentences = extract_sentences_with_keyword(text, keyword, page_num)
                    all_data.extend(sentences)  # Append the data to the list
    except Exception as e:
        print(f"An error occurred: {e}")

    return all_data

@app.route('/')
def index():
    # Search keywords in the PDF
    found_data = search_keywords_in_pdf(PDF_FILE_PATH, [])
    # Render the HTML template with PDF results
    return render_template('index.html', pdf_results=found_data)

@app.route('/search', methods=['POST'])
def search():
    # Get JSON data from request
    data = request.get_json()
    # Extract keywords from JSON data
    keywords = data['keywords']
    # Search for keywords in the PDF
    found_data = search_keywords_in_pdf(PDF_FILE_PATH, keywords)
    # Return JSON response with found data
    return jsonify(found_data)

@app.route('/view_pdf')
def view_pdf():
    page_number = request.args.get('page')  # Get the page number from the query parameters
    return send_file(PDF_FILE_PATH)

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)
