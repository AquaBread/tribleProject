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
    searchInfoDiv.innerHTML = `<b>Search Duration:</b> ${data.duration.toFixed(3)} seconds <br><b>Results Found:</b> ${data.num_results}`;

    // Show the Trible Search heading
    document.getElementById("trible-knowledge-heading").classList.remove("hidden");
}

// Function to display PDF results
function displayPdfResults(results) {
    var resultsDiv = document.getElementById("results");
    var leftColumn = document.getElementById("left-column");
    var questionnaire = document.getElementById("questionnaire");
    var tribleKnowledgeHeading = document.getElementById("trible-knowledge-heading");

    resultsDiv.innerHTML = ""; // Pseudo refresh function
    if (results.length === 0) {
        resultsDiv.innerHTML = "No results found.";
    } else {
        // Show the PDF Results heading
        document.getElementById("pdf-results-heading").classList.remove("hidden");
        leftColumn.classList.add("scrollable"); // Enable scrolling
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
        // Show the questionnaire
        questionnaire.classList.remove("hidden");
        tribleKnowledgeHeading.classList.remove("hidden");
    }
}

// Function to intra navigate to pdf
function intraNavToPdf(pageNumber) {
    var url = `/view_pdf?page=${pageNumber}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0`;
    window.location.href = url; // opens in same page (window.open(url, '_blank');
}

function submitProblem(event) {
    event.preventDefault();

    var name = document.getElementById("name").value;
    var problemDescription = document.getElementById("problem-description").value;
    var solution = document.getElementById("solution").value;

    fetch('/submit_problem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'name': name,
            'problem-description': problemDescription,
            'solution': solution
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        // Display thank you message
        var thankYouMessage = document.getElementById("thank-you-message");
        thankYouMessage.classList.remove("hidden");
        // Clear form
        document.getElementById("problem-form").reset();
        // Hide thank you message after 3 seconds
        setTimeout(function() {
            thankYouMessage.classList.add("hidden");
        }, 2000);
    })
    .catch(error => console.error('Error:', error));
}


