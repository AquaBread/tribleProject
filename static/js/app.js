// Function to search keywords
function searchKeywords() {
    // Get the keywords input from the user
    var keywordsInput = document.getElementById("keywords").value;
    // Split the input by commas and trim whitespace
    var keywords = keywordsInput.split(",").map(keyword => keyword.trim());

    // Send a POST request to the /search endpoint with the keywords
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords: keywords }),  // Convert the keywords array to JSON
    })
    .then(response => response.json())  // Parse the response as JSON
    .then(data => {
        // Display the search info and results
        displaySearchInfo(data);
        displayPdfResults(data.results, keywords);
    })
    .catch(error => console.error('Error:', error));  // Log any errors
}

// Function to display search info
function displaySearchInfo(data) {
    // Get the element to display search info
    var searchInfoDiv = document.getElementById("search-info");
    // Set the inner HTML with the search duration and number of results
    searchInfoDiv.innerHTML = `<b>Search Duration:</b> ${data.duration.toFixed(3)} seconds <br><b>Results Found:</b> ${data.num_results}`;

    // Show the Trible Search heading
    document.getElementById("trible-knowledge-heading").classList.remove("hidden");
}

// Function to display PDF results
function displayPdfResults(results, keywords) {
    // Get the elements for displaying results and other related elements
    var resultsDiv = document.getElementById("results");
    var leftColumn = document.getElementById("left-column");
    var questionnaire = document.getElementById("questionnaire");
    var tribleKnowledgeHeading = document.getElementById("trible-knowledge-heading");

    // Clear previous results (pseudo refresh function)
    resultsDiv.innerHTML = ""; 
    if (results.length === 0) {
        // Display message if no results found
        resultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
    } else {
        // Show the PDF Results heading
        document.getElementById("pdf-results-heading").classList.remove("hidden");
        // Enable scrolling for the left column
        leftColumn.classList.add("scrollable"); 
        // Loop through each result and create links
        results.forEach(result => {
            var link = document.createElement("a");
            link.innerHTML = "<b>Keyword:</b> " + result.Keyword +  "<br><b>Sentence:</b> " + result.Sentence + "<br><br>";
            link.href = "#";  // Set a placeholder href
            // Set the click event to navigate to the specific page in the PDF
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

// Function to intra navigate to PDF page
function intraNavToPdf(pageNumber) {
    // Create the URL for the specific page in the PDF
    var url = `/view_pdf?page=${pageNumber}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0`;
    // Navigate to the URL in the same window
    window.location.href = url; 
}

// Function to handle problem submission
function submitProblem(event) {
    event.preventDefault();  // Prevent the default form submission

    // Get the form data
    var name = document.getElementById("name").value;
    var problemDescription = document.getElementById("problem-description").value;
    var solution = document.getElementById("solution").value;

    // Send a POST request to the /submit_problem endpoint with JSON data
    fetch('/submit_problem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'name': name,
            'problem-description': problemDescription,
            'solution': solution
        }),
    })
    .then(response => response.json())  // Parse the response as JSON
    .then(data => {
        console.log(data.message);  // Log the success message
        // Display thank you message
        var thankYouMessage = document.getElementById("thank-you-message");
        thankYouMessage.classList.remove("hidden");
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        // Clear the form
        document.getElementById("problem-form").reset();
        // Hide thank you message after 3 seconds
        setTimeout(function() {
            thankYouMessage.classList.add("hidden");
        }, 2000);
    })
    .catch(error => console.error('Error:', error));  // Log any errors
}