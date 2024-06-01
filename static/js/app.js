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
        displayPdfResults(data.results, data.duration);
    })
    .catch(error => console.error('Error:', error));
}

function displayPdfResults(results, duration) {
    var resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Pseudo refresh function

    var durationDiv = document.createElement("div");
    durationDiv.innerHTML = "<b>Search Duration:</b> " + duration.toFixed(2) + " seconds";
    resultsDiv.appendChild(durationDiv);

    if (results.length === 0) {
        resultsDiv.innerHTML += "<br>No results found.";
    } else {
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


// Function to intra navigate to pdf
function intraNavToPdf(pageNumber) {
    var url = `/view_pdf?page=${pageNumber}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0`;
    window.location.href = url; // opens in same page (window.open(url, '_blank');
}
