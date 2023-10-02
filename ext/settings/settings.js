let keywords = [];

document.addEventListener('DOMContentLoaded', function () {
    loadKeywords();
    focusInputForm();
    initAddKeywordForm();
});

function loadKeywords() {
    chrome.storage.sync.get('keywords', function (data) {
        if (data.keywords) {
            keywords = data.keywords;
        }
        updateKeywordsDisplay();
    });
    console.log(chrome.storage.sync.get('keywords'));
}

function focusInputForm(){
    const inputElement = document.getElementById('add-keyword-input');
    inputElement.focus();
}

function initAddKeywordForm() {
    document.getElementById('add-keyword-form').addEventListener('submit', function (event) {
        event.preventDefault();
        let keyword = document.getElementById('add-keyword-input').value;
        addKeyword(keyword);
        document.getElementById('add-keyword-input').value = '';
    });
}

function addKeyword(keyword) {
    keyword = keyword.trim().toLowerCase();
    if (keyword === '') {
        console.log('Cannot add an empty keyword.');
        return;
    }
    if (keywords.includes(keyword)) {
        console.log('This keyword is already in the list.');
        return;
    }
    keywords.push(keyword);
    chrome.storage.sync.set({ keywords: keywords }, function () {
        console.log('Keyword added to the list.');
    });
    updateKeywordsDisplay();
    console.log(chrome.storage.sync.get('keywords'));
}

function updateKeywordsDisplay() {
    const container = document.getElementById('keywords-container');
    container.innerHTML = '';
    keywords.forEach(keyword => {
        const keywordDiv = document.createElement('div');
        keywordDiv.classList.add('keyword');
        const button = document.createElement('button');
        button.textContent = keyword;
        button.classList.add('keyword-button');
        keywordDiv.appendChild(button);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.classList.add('keyword-delete-button');
        deleteButton.addEventListener('click', function () {
            removeKeyword(keyword);
        });
        keywordDiv.appendChild(deleteButton);
        container.appendChild(keywordDiv);
    });
}

function removeKeyword(keywordToRemove) {
    keywords = keywords.filter(keyword => keyword !== keywordToRemove);
    chrome.storage.sync.set({ keywords: keywords }, function () {
        console.log('Keyword removed from the list.');
    });
    updateKeywordsDisplay();
}


