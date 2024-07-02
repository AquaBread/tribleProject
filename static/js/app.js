function searchKeywords() {
    // Get the input value from the element with id "keywords"
    var keywordsInput = document.getElementById("keywords").value;
    // Split the input value by commas and trim whitespace from each keyword
    var keywords = keywordsInput.split(",").map(keyword => keyword.trim());

    // Make a POST request to the '/search' endpoint with the keywords
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords: keywords }),
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => {
        // Display search information and results
        displaySearchInfo(data);
        displayResults(data.results.tkData, data.results.pdfData, keywords);
    })
    .catch(error => console.error('Error:', error)); // Handle errors
}

function displaySearchInfo(data) {
    // Get the element with id "search-info" and update its HTML content
    var searchInfoDiv = document.getElementById("search-info");
    searchInfoDiv.innerHTML = `<b>Search Duration:</b> ${data.duration.toFixed(3)} seconds <br><b>Results Found:</b> ${data.num_results}`;

    // Remove the "hidden" class from specific heading elements to make them visible
    document.getElementById("trible-knowledge-heading").classList.remove("hidden");
    document.getElementById("pdf-results-heading").classList.remove("hidden");
}

function displayResults(tkResults, pdfResults, keywords) {
    // Get the elements for displaying results
    var tkResultsDiv = document.getElementById("tk-results");
    var pdfResultsDiv = document.getElementById("pdf-results");
    var tribleKnowledgeHeading = document.getElementById("trible-knowledge-heading");
    var pdfResultsHeading = document.getElementById("pdf-results-heading");

    // Clear the current content of the results divs
    tkResultsDiv.innerHTML = "";
    pdfResultsDiv.innerHTML = "";

    // Check if there are no results
    if (tkResults.length === 0 && pdfResults.length === 0) {
        pdfResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
        tkResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
    } else {
        // If there are Trible Knowledge results, display them
        if (tkResults.length > 0) {
            tribleKnowledgeHeading.classList.remove("hidden");

            tkResults.forEach(result => {
                var link = document.createElement("a");
                link.innerHTML = `
                    <b>Trible Knowledge</b><br>
                    <b>Submitted by:</b> ${result.Name}<br>
                    <b>Problem Description:</b> ${result['Problem Description']}<br>
                    <b>Solution:</b> ${result.Solution}<br>
                    <b>Chapter:</b> ${result.Chapter}<br>
                `;
                link.href = "#";
                link.onclick = function() {
                    intraNavToPdf(result['Chapter Page']);
                };
                tkResultsDiv.appendChild(link);
                tkResultsDiv.appendChild(document.createElement("br"));
            });
        } else {
            tkResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
        }

        // If there are PDF results, display them
        if (pdfResults.length > 0) {
            pdfResultsHeading.classList.remove("hidden");

            pdfResults.forEach(result => {
                var link = document.createElement("a");
                link.innerHTML = `
                    <b>Keyword:</b> ${result.Keyword}<br>
                    <b>Sentence:</b> ${result.Sentence}<br>
                `;
                link.href = "#";
                link.onclick = function() {
                    intraNavToPdf(result['Page Number']);
                };
                pdfResultsDiv.appendChild(link);
                pdfResultsDiv.appendChild(document.createElement("br"));
            });
        } else {
            pdfResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
        }

        // If there are any results, make the questionnaire visible
        if (tkResults.length > 0 || pdfResults.length > 0) {
            document.getElementById("questionnaire").classList.remove("hidden");
        }
    }
}

function intraNavToPdf(pageNumber) {
    // Construct the URL to navigate to a specific page in the PDF
    var url = `/view_pdf?page=${pageNumber}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0`;
    window.location.href = url; // Navigate to the constructed URL
}

function openForum() {
    // Open a new window with the forum page
    window.open("/forum", "Forum", "width=600,height=600");
}
