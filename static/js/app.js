document.addEventListener('DOMContentLoaded', (event) => {
    fetchTOC();
});

function fetchTOC() {
    fetch('/get_toc')
        .then(response => response.json())
        .then(data => {
            populateTOCDropdown(data);
        })
        .catch(error => console.error('Error fetching TOC:', error));
}

function populateTOCDropdown(toc) {
    var tocDropdown = document.getElementById("toc-dropdown");
    toc.forEach(item => {
        var option = document.createElement("option");
        option.value = item.Title;
        option.textContent = `Chapter ${item.Title}`;
        option.setAttribute('data-page', item.Page); // Add the page number as a data attribute
        tocDropdown.appendChild(option);
    });
}

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
        displayResults(data.results.tkData, data.results.pdfData, keywords);
    })
    .catch(error => console.error('Error:', error));
}

function displaySearchInfo(data) {
    var searchInfoDiv = document.getElementById("search-info");
    searchInfoDiv.innerHTML = `<b>Search Duration:</b> ${data.duration.toFixed(3)} seconds <br><b>Results Found:</b> ${data.num_results}`;
    document.getElementById("trible-knowledge-heading").classList.remove("hidden");
}

function displayResults(tkResults, pdfResults, keywords) {
    var resultsDiv = document.getElementById("results");
    var leftColumn = document.getElementById("left-column");
    var questionnaire = document.getElementById("questionnaire");
    var tribleKnowledgeHeading = document.getElementById("trible-knowledge-heading");

    resultsDiv.innerHTML = "";
    if (tkResults.length === 0 && pdfResults.length === 0) {
        resultsDiv.innerHTML = `No results found for "${keywords.join(', ')}".`;
    } else {
        document.getElementById("pdf-results-heading").classList.remove("hidden");
        leftColumn.classList.add("scrollable");

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
            resultsDiv.appendChild(link);
            resultsDiv.appendChild(document.createElement("br"));
        });

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
            resultsDiv.appendChild(link);
            resultsDiv.appendChild(document.createElement("br"));
        });

        questionnaire.classList.remove("hidden");
        tribleKnowledgeHeading.classList.remove("hidden");
    }
}

function intraNavToPdf(pageNumber) {
    var url = `/view_pdf?page=${pageNumber}#page=${pageNumber}&toolbar=0&navpanes=0&scrollbar=0`;
    window.location.href = url;
}

function submitProblem(event) {
    event.preventDefault();

    var name = document.getElementById("name").value;
    var problemDescription = document.getElementById("problem-description").value;
    var solution = document.getElementById("solution").value;
    var selectedChapter = document.getElementById("toc-dropdown").value;
    var chapterPage = document.getElementById("toc-dropdown").options[document.getElementById("toc-dropdown").selectedIndex].getAttribute('data-page'); // Get the page number from the selected option

    if (!selectedChapter) {
        alert("Chapter selection is required.");
        return;
    }

    fetch('/submit_problem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'name': name,
            'problem-description': problemDescription,
            'solution': solution,
            'chapter-name': selectedChapter,
            'chapter-page': chapterPage // Include chapter page number in the request
        }),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.json().then(data => {
                throw new Error(data.error);
            });
        }
    })
    .then(data => {
        console.log(data.message);
        var thankYouMessage = document.getElementById("thank-you-message");
        thankYouMessage.classList.remove("hidden");
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        document.getElementById("problem-form").reset();
        setTimeout(function() {
            thankYouMessage.classList.add("hidden");
        }, 2000);
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message);
    });
}
