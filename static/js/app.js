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

// Function to navigate to a specific page in the PDF
function intraNavToPdf(pageNumber) {
    const url = `/view_pdf?page=${pageNumber}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0`;
    window.location.href = url;
}

// Function to open the forum page
function openForum() {
    window.open("/forum", "Forum", "width=600,height=600");
}

function showUploadModal() {
    document.getElementById('upload-modal').style.display = 'block';
}

function hideUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    if (event.target == document.getElementById('upload-modal')) {
        hideUploadModal();
    }
}

// Function to display results
function displayResults(tkResults, pdfResults, keywords) {
    const tkResultsDiv = document.getElementById("tk-results");
    const pdfResultsDiv = document.getElementById("pdf-results");
    const tribleKnowledgeHeading = document.getElementById("trible-knowledge-heading");
    const pdfResultsHeading = document.getElementById("pdf-results-heading");

    tkResultsDiv.innerHTML = "";
    pdfResultsDiv.innerHTML = "";

    let tkResultsFound = false;
    let pdfResultsFound = false;

    // Function to strip HTML tags
    function stripHtmlTags(str) {
        return str.replace(/<\/?[^>]+(>|$)/g, "");
    }

    // Function to bold the keyword in the sentence
    function boldKeyword(sentence, keyword) {
        const regex = new RegExp(`(${keyword})`, "gi");
        return sentence.replace(regex, "<b>$1</b>");
    }

    // Display Trible Knowledge Results
    if (tkResults.length > 0) {
        tribleKnowledgeHeading.classList.remove("hidden");

        keywords.forEach(keyword => {
            const keywordDiv = document.createElement("div");
            const keywordHeading = document.createElement("h3");
            const keywordResultsDiv = document.createElement("div");
            keywordResultsDiv.classList.add("keyword-results");

            if (keywords.length === 1) {
                keywordResultsDiv.style.display = "block";
            } else {
                keywordResultsDiv.style.display = "none";
            }

            const keywordResults = tkResults.filter(result => {
                const problemDescription = stripHtmlTags(result['Problem Description']);
                const solution = stripHtmlTags(result.Solution);
                return problemDescription.toLowerCase().includes(keyword.toLowerCase()) || solution.toLowerCase().includes(keyword.toLowerCase());
            });

            if (keywordResults.length > 0) {
                tkResultsFound = true;
                keywordHeading.innerText = `Results for "${keyword}"`;
                keywordHeading.classList.add("keyword-heading");

                if (keywords.length > 1) {
                    keywordHeading.onclick = () => {
                        keywordResultsDiv.style.display = keywordResultsDiv.style.display === "none" ? "block" : "none";
                    };
                }

                keywordResults.forEach(result => {
                    const resultDiv = document.createElement("div");
                    resultDiv.classList.add("result-item");
                    resultDiv.innerHTML = `
                        <b>Submitted by:</b> ${result.Name}<br>
                        <b>Problem Description:</b> ${boldKeyword(result['Problem Description'], keyword)}<br>
                        <b>Solution:</b> ${boldKeyword(result.Solution, keyword)}<br>
                        <b>Chapter:</b> ${result.Chapter}<br>
                    `;
                    keywordResultsDiv.appendChild(resultDiv);
                });

                keywordDiv.appendChild(keywordHeading);
                keywordDiv.appendChild(keywordResultsDiv);
                tkResultsDiv.appendChild(keywordDiv);
            }
        });

        if (!tkResultsFound && keywords.length === 1) {
            tkResultsDiv.innerHTML = `No results found for "${keywords[0]}".`;
        }
    } else {
        tkResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
    }

    // Display PDF Results
    if (pdfResults.length > 0) {
        pdfResultsHeading.classList.remove("hidden");

        keywords.forEach(keyword => {
            const keywordDiv = document.createElement("div");
            const keywordHeading = document.createElement("h3");
            const keywordResultsDiv = document.createElement("div");
            keywordResultsDiv.classList.add("keyword-results");

            if (keywords.length === 1) {
                keywordResultsDiv.style.display = "block";
            } else {
                keywordResultsDiv.style.display = "none";
            }

            const keywordResults = pdfResults.filter(result => {
                return result.Keyword && result.Keyword.toLowerCase().includes(keyword.toLowerCase());
            });

            if (keywordResults.length > 0) {
                pdfResultsFound = true;
                keywordHeading.innerText = `Results for "${keyword}"`;
                keywordHeading.classList.add("keyword-heading");

                if (keywords.length > 1) {
                    keywordHeading.onclick = () => {
                        keywordResultsDiv.style.display = keywordResultsDiv.style.display === "none" ? "block" : "none";
                    };
                }

                keywordResults.forEach(result => {
                    const link = document.createElement("a");
                    link.innerHTML = `
                        ${boldKeyword(result.Sentence, keyword)}<br>
                    `;
                    link.href = "#";
                    link.onclick = () => intraNavToPdf(result['Page Number']);
                    keywordResultsDiv.appendChild(link);
                    keywordResultsDiv.appendChild(document.createElement("br"));
                });

                keywordDiv.appendChild(keywordHeading);
                keywordDiv.appendChild(keywordResultsDiv);
                pdfResultsDiv.appendChild(keywordDiv);
            }
        });

        if (!pdfResultsFound && keywords.length === 1) {
            pdfResultsDiv.innerHTML = `No results found for "${keywords[0]}".`;
        }
    } else {
        pdfResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
    }
}
