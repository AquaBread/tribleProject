const socket = io();

socket.on('progress', function (data) {
    const progress = data.progress;
    document.getElementById('progress-bar').value = progress;
    document.getElementById('progress-text').textContent = `${progress.toFixed(2)}%`;
});

document.getElementById('upload-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            document.getElementById('progress-bar').value = percentComplete;
            document.getElementById('progress-text').textContent = `${percentComplete.toFixed(2)}%`;
            document.getElementById('loading-container').style.display = 'block';
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            hideUploadModal();
            document.getElementById('progress-bar').value = 0;
            document.getElementById('progress-text').textContent = '0%';
            document.getElementById('loading-container').style.display = 'none';
            alert('File uploaded successfully!');
        } else if (xhr.status === 400) {
            // Handle the specific error from the server
            const response = JSON.parse(xhr.responseText);
            alert(response.error || 'Failed to upload file.');
        } else {
            alert('Failed to upload file.');
        }
    };

    xhr.send(formData);
});


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

function displaySearchInfo(data) {
    const searchInfoDiv = document.getElementById("search-info");
    searchInfoDiv.innerHTML = `<b>Search Duration:</b> ${data.duration.toFixed(3)} seconds <br><b>Results Found:</b> ${data.num_results}`;

    document.getElementById("traible-knowledge-heading").classList.remove("hidden");
    document.getElementById("pdf-results-heading").classList.remove("hidden");
}

function intraNavToPdf(pageNumber, title) {
    const url = `/view_pdf?title=${encodeURIComponent(title)}#page=${pageNumber}`;
    window.location.href = url;
}

function openForum() {
    window.open("/forum", "Forum", "width=600,height=600");
}

window.onclick = function(event) {
    if (event.target == document.getElementById('upload-modal')) {
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

document.addEventListener('DOMContentLoaded', function() {
    if (initialUploadRequired) {
        showUploadModal(true);
    }
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', function() {
        if (fileInput.value) {
            document.querySelector('.modal .close').style.display = 'block';
        }
    });
});

function displayResults(tkResults, pdfResults, keywords) {
    const tkResultsDiv = document.getElementById("tk-results");
    const pdfResultsDiv = document.getElementById("pdf-results");
    const traibleKnowledgeHeading = document.getElementById("traible-knowledge-heading");
    const pdfResultsHeading = document.getElementById("pdf-results-heading");

    tkResultsDiv.innerHTML = "";
    pdfResultsDiv.innerHTML = "";

    let tkResultsFound = false;
    let pdfResultsFound = false;

    function stripHtmlTags(str) {
        return str.replace(/<\/?[^>]+(>|$)/g, "");
    }

    function boldKeyword(sentence, keyword) {
        const regex = new RegExp(`(${keyword})`, "gi");
        return sentence.replace(regex, "<b>$1</b>");
    }

    if (tkResults.length > 0) {
        traibleKnowledgeHeading.classList.remove("hidden");

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

        if (!pdfResultsFound && keywords.length === 1) {
            pdfResultsDiv.innerHTML = `No results found for "${keywords[0]}".`;
        }
    } else {
        pdfResultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
    }
}