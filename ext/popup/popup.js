let keywords = [];
const root = document.documentElement;

document.addEventListener('DOMContentLoaded', function () {
    loadDataTheme();
    loadKeywords();
    focusInputForm();
    initAddKeywordForm();
});

document.getElementById('navigateToParamButton').addEventListener('click', function() {
    openSettingsPage();
});

document.getElementById("themeToggle").addEventListener("click", function() {
    if (root.getAttribute("data-theme") === "light") {
        root.setAttribute("data-theme", "dark");
        chrome.storage.sync.set({ dataTheme: "dark" }, function () {
            console.log('Switched to dark theme');
        });
        document.getElementById('theme-icon').textContent = 'dark_mode';
    } else {
        root.setAttribute("data-theme", "light");
        chrome.storage.sync.set({ dataTheme: "light" }, function () {
            console.log('Switched to light theme');
        });
        document.getElementById('theme-icon').textContent = 'light_mode';

    }
});

function loadDataTheme() {
    chrome.storage.sync.get('dataTheme', function (data) {
        if (data.dataTheme) {
            root.setAttribute("data-theme", data.dataTheme);
            document.getElementById('theme-icon').textContent = data.dataTheme+'_mode';
        } else {
            root.setAttribute("data-theme", "light");
            document.getElementById('theme-icon').textContent = 'light_mode';
        }
    });
    console.log(chrome.storage.sync.get('dataTheme'));
}

function loadKeywords() {
    chrome.storage.sync.get('keywords', function (data) {
        if (data.keywords) {
            keywords = data.keywords;
        }
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
    console.log(chrome.storage.sync.get('keywords'));
}

function openSettingsPage() {
    chrome.tabs.create({ url: 'settings/settings.html' });
}
