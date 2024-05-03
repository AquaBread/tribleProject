// This function is responsible for searching keywords entered by the user.
function searchKeywords() { 
    // Get the value of the keywords input field and split it into an array of keywords
    var keywordsInput = document.getElementById("keywords").value;
    var keywords = keywordsInput.split(",").map(keyword => keyword.trim());
    
    // Send a POST request to the server with the list of keywords
    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords: keywords }),
    })
    .then(response => response.json())
    .then(data => {
        // Get the results container element
        var resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = ""; // Clear previous results
        
        // Check if any results were returned from the server
        if (data.length === 0) {
            resultsDiv.innerHTML = "No results found."; // Display a message if no results were found
        } else {
            // Iterate through each result returned from the server
            data.forEach(result => {
                // Create a link element for each result containing keyword, page number, and sentence
                var link = document.createElement("a");
                link.innerHTML = "<b>Keyword:</b> " + result.Keyword + "<br><b>Page Number:</b> " + result["Page Number"] + "<br><b>Sentence:</b> " + result.Sentence + "<br><br>";
                // Set the href attribute of the link to trigger the viewPdf function
                link.href = "javascript:void(0)";
                link.onclick = function() {
                    viewPdf(result["Page Number"]); // Pass the page number to viewPdf function when link is clicked
                };
                // Append the link to the results container
                resultsDiv.appendChild(link);
                resultsDiv.appendChild(document.createElement("br")); // Add a line break for spacing
            });
        }
    })
    .catch(error => console.error('Error:', error)); // Log any errors that occur during the request
}

