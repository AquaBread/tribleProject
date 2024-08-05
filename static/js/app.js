const socket = io();

socket.on('progress', function (data) {
    const progress = data.progress;
    document.getElementById('progress-bar').value = progress;
    document.getElementById('progress-text').textContent = `${progress.toFixed(2)}%`;
});

socket.on('update_pdf_titles', function (pdfTitles) {
    const pdfTitleDropdown = document.getElementById('pdf-title-dropdown');
    if (pdfTitleDropdown) {
        pdfTitleDropdown.innerHTML = '<option value="">Select PDF Title</option>'; // Clear existing options
        pdfTitles.forEach(title => {
            const option = document.createElement('option');
            option.value = title;
            option.textContent = title;
            pdfTitleDropdown.appendChild(option);
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const pdfTitleDropdown = document.getElementById('pdf-title-dropdown');

    // Other DOMContentLoaded code
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function (event) {
            event.preventDefault();
            // Upload logic
        });
    }

    // File input change event
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (fileInput.value) {
                document.querySelector('.modal .close').style.display = 'block';
            }
        });
    }

    // Dropdown change event
    if (pdfTitleDropdown) {
        pdfTitleDropdown.addEventListener('change', updateSearchByTitle);
    }
});

function searchKeywords(pdfTitle) {
    const keywordsInput = document.getElementById("keywords").value;
    const keywords = keywordsInput.split(",").map(keyword => keyword.trim());

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords, pdf_title: pdfTitle }),
    })
    .then(response => response.json())
    .then(data => {
        displaySearchInfo(data);
        displayResults(data.results.tkData, data.results.pdfData, keywords);
    })
    .catch(error => console.error('Error:', error));
}

function updateSearchByTitle() {
    const pdfTitle = document.getElementById("pdf-title-dropdown").value;
    searchKeywords(pdfTitle);
}

// Ensure that there's only one event listener for the search form
document.getElementById('search-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    searchKeywords(document.getElementById("pdf-title-dropdown").value);
});

function displaySearchInfo(data) {
    const searchInfoDiv = document.getElementById("search-info");
    searchInfoDiv.innerHTML = `<b>Search Duration:</b> ${data.duration.toFixed(3)} seconds <br><b>Results Found:</b> ${data.num_results}`;

    document.getElementById("traible-knowledge-heading")?.classList.remove("hidden");
    document.getElementById("pdf-results-heading")?.classList.remove("hidden");
}

function intraNavToPdf(pageNumber, title) {
    const url = `/view_pdf?title=${encodeURIComponent(title)}#page=${pageNumber}`;
    window.location.href = url;
}

function openForum() {
    window.open("/forum", "Forum", "width=600,height=600");
}

window.onclick = function(event) {
    if (event.target === document.getElementById('upload-modal')) {
        hideUploadModal();
    }
}

function showUploadModal(mandatory = false) {
    const modal = document.getElementById('upload-modal');
    const closeBtn = modal.querySelector('.close');
    modal.style.display = 'block';

    if (mandatory) {
        closeBtn.style.display = 'none';
        modal.addEventListener('click', preventClose);
    } else {
        closeBtn.style.display = 'block';
        modal.onclick = function(event) {
            if (event.target === modal) {
                hideUploadModal();
            }
        };
    }
}

function hideUploadModal() {
    const modal = document.getElementById('upload-modal');
    modal.style.display = 'none';
    modal.removeEventListener('click', preventClose);
}

function checkFileUploaded() {
    const fileInput = document.getElementById('file-input');
    if (!fileInput.value) {
        alert('You must upload a file before proceeding.');
        return false;
    }
    return true;
}

function preventClose(event) {
    if (event.target === document.getElementById('upload-modal')) {
        event.preventDefault();
        event.stopPropagation();
    }
}

function displayResults(tkResults, pdfResults, keywords) {
    const tkResultsDiv = document.getElementById("tk-results");
    const pdfResultsDiv = document.getElementById("pdf-results");
    const pdfTitleDropdown = document.getElementById("pdf-title-dropdown");

    tkResultsDiv.innerHTML = "";
    pdfResultsDiv.innerHTML = "";
    
    // Hide the dropdown initially
    if (pdfTitleDropdown) {
        pdfTitleDropdown.classList.add("hidden");
    }

    // Display TK results
    if (tkResults.length > 0) {
        document.getElementById("traible-knowledge-heading")?.classList.remove("hidden");
        keywords.forEach(keyword => {
            const keywordDiv = document.createElement("div");
            const keywordHeading = document.createElement("h3");
            const keywordResultsDiv = document.createElement("div");
            keywordResultsDiv.classList.add("keyword-results");

            const keywordResults = tkResults.filter(result => {
                return result['Problem Description'].toLowerCase().includes(keyword.toLowerCase()) || result['Solution'].toLowerCase().includes(keyword.toLowerCase());
            });

            if (keywordResults.length > 0) {
                keywordHeading.innerText = `Results for "${keyword}"`;
                keywordHeading.classList.add("keyword-heading");
                keywordResults.forEach(result => {
                    const resultDiv = document.createElement("div");
                    resultDiv.classList.add("result-item");
                    resultDiv.innerHTML = `
                        <b>Submitted by:</b> ${result.Name}<br>
                        <b>Problem Description:</b> ${result['Problem Description']}<br>
                        <b>Solution:</b> ${result.Solution}<br>
                        <b>Chapter:</b> ${result.Chapter}<br>
                    `;
                    keywordResultsDiv.appendChild(resultDiv);
                });
                keywordDiv.appendChild(keywordHeading);
                keywordDiv.appendChild(keywordResultsDiv);
                tkResultsDiv.appendChild(keywordDiv);
            }
        });
    } else {
        tkResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
    }

    // Display PDF results
    if (pdfResults.length > 0) {
        document.getElementById("pdf-results-heading")?.classList.remove("hidden");
        document.getElementById("pdf-title-dropdown")?.classList.remove("hidden");
        if (pdfTitleDropdown) {
            pdfTitleDropdown.classList.remove("hidden"); // Show the dropdown when there are PDF results
        }
        keywords.forEach(keyword => {
            const keywordDiv = document.createElement("div");
            const keywordHeading = document.createElement("h3");
            const keywordResultsDiv = document.createElement("div");
            keywordResultsDiv.classList.add("keyword-results");

            const keywordResults = pdfResults.filter(result => {
                return result.Keyword && result.Keyword.toLowerCase().includes(keyword.toLowerCase());
            });

            if (keywordResults.length > 0) {
                keywordHeading.innerText = `Results for "${keyword}"`;
                keywordHeading.classList.add("keyword-heading");
                keywordResults.forEach(result => {
                    const link = document.createElement("a");
                    link.innerHTML = `
                        ${result.Sentence}<br>
                        <b>PDF Title:</b> ${result.Title}<br>
                        <b>Page Number:</b> ${result['Page Number']}<br>
                    `;
                    link.href = "#";
                    link.onclick = () => intraNavToPdf(result['Page Number'], result.Title);
                    keywordResultsDiv.appendChild(link);
                    keywordResultsDiv.appendChild(document.createElement("br"));
                });
                keywordDiv.appendChild(keywordHeading);
                keywordDiv.appendChild(keywordResultsDiv);
                pdfResultsDiv.appendChild(keywordDiv);
            }
        });
    } else {
        pdfResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
    }
}
