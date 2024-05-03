from flask import Flask, render_template, request, jsonify, send_file
import fitz  # PyMuPDF library for PDF handling
import re  # Regular expression module for text processing

app = Flask(__name__)  # Initialize Flask application 

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

    return all_data

@app.route('/')
def index():
    # Render the HTML template for the main page
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    # Get JSON data from request
    data = request.get_json()
    # Extract keywords from JSON data
    keywords = data['keywords']
    # Path to the PDF file
    pdf_file = 'Resources/physText.pdf'
    # Search for keywords in the PDF
    found_data = search_keywords_in_pdf(pdf_file, keywords)
    # Return JSON response with found data
    return jsonify(found_data)

@app.route('/view_pdf')
def view_pdf():
    page_number = request.args.get('page')  # Get the page number from the query parameters
    pdf_file = 'Resources/physText.pdf'  # Path to the PDF file
    # Return the specified page in the PDF
    response = send_file(pdf_file, as_attachment=True, conditional=True, mimetype='application/pdf')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)
