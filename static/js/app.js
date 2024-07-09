// Function to search for keywords
function searchKeywords() {
    const keywordsInput = document.getElementById("keywords").value;
    const keywords = keywordsInput.split(",").map(keyword => keyword.trim());

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords }),
    })
    .then(response => response.json())
    .then(data => {
        displaySearchInfo(data);
        displayResults(data.results.tkData, data.results.pdfData, keywords);
    })
    .catch(error => console.error('Error:', error));
}

// Function to display search information
function displaySearchInfo(data) {
    const searchInfoDiv = document.getElementById("search-info");
    searchInfoDiv.innerHTML = `<b>Search Duration:</b> ${data.duration.toFixed(3)} seconds <br><b>Results Found:</b> ${data.num_results}`;

    document.getElementById("trible-knowledge-heading").classList.remove("hidden");
    document.getElementById("pdf-results-heading").classList.remove("hidden");
}

// Function to display results
function displayResults(tkResults, pdfResults, keywords) {
    const tkResultsDiv = document.getElementById("tk-results");
    const pdfResultsDiv = document.getElementById("pdf-results");
    const tribleKnowledgeHeading = document.getElementById("trible-knowledge-heading");
    const pdfResultsHeading = document.getElementById("pdf-results-heading");

    tkResultsDiv.innerHTML = "";
    pdfResultsDiv.innerHTML = "";

    if (tkResults.length === 0 && pdfResults.length === 0) {
        const noResultsMessage = `No results found for "${keywords.join(', ')}".`;
        tkResultsDiv.innerHTML = noResultsMessage;
        pdfResultsDiv.innerHTML = noResultsMessage;
    } else {
        if (tkResults.length > 0) {
            tribleKnowledgeHeading.classList.remove("hidden");
            tkResults.forEach(result => {
                const link = document.createElement("a");
                link.innerHTML = `
                    <b>Trible Knowledge</b><br>
                    <b>Submitted by:</b> ${result.Name}<br>
                    <b>Problem Description:</b> ${result['Problem Description']}<br>
                    <b>Solution:</b> ${result.Solution}<br>
                    <b>Chapter:</b> ${result.Chapter}<br>
                `;
                link.href = "#";
                link.onclick = () => intraNavToPdf(result['Chapter Page']);
                tkResultsDiv.appendChild(link);
                tkResultsDiv.appendChild(document.createElement("br"));
            });
        } else {
            tkResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
        }

        if (pdfResults.length > 0) {
            pdfResultsHeading.classList.remove("hidden");

            // Group results by keywords
            keywords.forEach(keyword => {
                const keywordDiv = document.createElement("div");
                const keywordHeading = document.createElement("h3");
                const keywordResultsDiv = document.createElement("div");
                keywordResultsDiv.classList.add("keyword-results");

                // Automatically reveal results if there's only one keyword
                if (keywords.length === 1) {
                    keywordResultsDiv.style.display = "block";
                } else {
                    keywordResultsDiv.style.display = "none"; // Hide initially
                }

                const keywordResults = pdfResults.filter(result => result.Keyword.toLowerCase() === keyword.toLowerCase());

                keywordHeading.innerText = `Results for "${keyword}"`;
                keywordHeading.classList.add("keyword-heading");

                // Toggle display on click only if there's more than one keyword
                if (keywords.length > 1) {
                    keywordHeading.onclick = () => {
                        keywordResultsDiv.style.display = keywordResultsDiv.style.display === "none" ? "block" : "none";
                    };
                }
                
                keywordResults.forEach(result => {
                    const resultLink = document.createElement("a");
                    resultLink.innerHTML = `
                        <b>Keyword:</b> ${result.Keyword}<br>
                        <b>Sentence:</b> ${result.Sentence}<br>
                    `;
                    resultLink.href = "#";
                    resultLink.onclick = () => intraNavToPdf(result['Page Number']);
                    keywordResultsDiv.appendChild(resultLink);
                    keywordResultsDiv.appendChild(document.createElement("br"));
                });

                keywordDiv.appendChild(keywordHeading);
                keywordDiv.appendChild(keywordResultsDiv);
                pdfResultsDiv.appendChild(keywordDiv);
            });
        } else {
            pdfResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
        }
    }
}

// Function to navigate to a specific page in the PDF
function intraNavToPdf(pageNumber) {
    const url = `/view_pdf?page=${pageNumber}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0`;
    window.location.href = url;
}

// Function to open the forum page
function openForum() {
    window.open("/forum", "Forum", "width=600,height=600");
}
