// Function to search keywords 
function searchKeywords() {
    var keywordsInput = document.getElementById("keywords").value;
    var keywords = keywordsInput.split(",").map(keyword => keyword.trim());

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords: keywords }),
    })
    .then(response => response.json())
    .then(data => {
        displaySearchInfo(data);
        displayPdfResults(data.results);
    })
    .catch(error => console.error('Error:', error));
}

// Function to display search info
function displaySearchInfo(data) {
    var searchInfoDiv = document.getElementById("search-info");
    searchInfoDiv.innerHTML = `<b>Search Duration:</b> ${data.duration.toFixed(3)} seconds, <b>Results Found:</b> ${data.num_results}`;
}

// Function to display PDF results
function displayPdfResults(results) {
    var resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Pseudo refresh function
    if (results.length === 0) {
        resultsDiv.innerHTML = "No results found.";
    } else {
        // Show the PDF Results heading
        document.getElementById("pdf-results-heading").classList.remove("hidden");

        results.forEach(result => {
            var link = document.createElement("a");
            link.innerHTML = "<b>Keyword:</b> " + result.Keyword +  "<br><b>Sentence:</b> " + result.Sentence + "<br><br>";
            link.href = "#"; // Set a placeholder href
            link.onclick = function() {
                intraNavToPdf(result["Page Number"]);
            };
            resultsDiv.appendChild(link);
            resultsDiv.appendChild(document.createElement("br"));
        });
    }
}

// Function to display search info
function displaySearchInfo(data) {
    var searchInfoDiv = document.getElementById("search-info");
    searchInfoDiv.innerHTML = `<b>Search Duration:</b> ${data.duration.toFixed(3)} seconds, <b>Results Found:</b> ${data.num_results}`;

    // Show the Trible Search heading
    document.getElementById("trible-search-heading").classList.remove("hidden");
}



// Function to intra navigate to pdf
function intraNavToPdf(pageNumber) {
    var url = `/view_pdf?page=${pageNumber}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0`;
    window.location.href = url; // opens in same page (window.open(url, '_blank');
}