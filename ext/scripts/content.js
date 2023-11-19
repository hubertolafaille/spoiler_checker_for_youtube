const DEBOUNCE_TIME = 500;
const MAX_REQUEST_PARAM_SIZE = 50;
const THUMBNAIL_ANCHOR_SELECTOR = 'a#thumbnail';
const YOUTUBE_CONTENT_HTML_ELEMENT_SELECTOR = '#dismissible:not(.ytd-rich-shelf-renderer):not(.ytd-shelf-renderer):has(' + THUMBNAIL_ANCHOR_SELECTOR + '[href])';
const API_ENDPOINT = '/youtube/fetch-video-info?video-id-list=';
const API_URL = 'ENTER_YOUR_SERVER_ADDRESS';

observeDOM();

function observeDOM() {
    const targetNode = document.querySelector('ytd-app');
    if (!targetNode) {
        setTimeout(observeDOM, 500);
        return;
    }
    const debouncedCollectVideoIds = debounce(checkSpoiler, DEBOUNCE_TIME);
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                debouncedCollectVideoIds();
            }
        }
    });
    observer.observe(targetNode, { childList: true, subtree: true });
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

async function checkSpoiler() {
    let youtubeContentHtmlElementList = Array.from(document.querySelectorAll(YOUTUBE_CONTENT_HTML_ELEMENT_SELECTOR));
    youtubeContentHtmlElementList = youtubeContentHtmlElementList.filter(youtubeContentHtmlElement => !isChecked(youtubeContentHtmlElement));
    youtubeContentHtmlElementList = unblurredClips(youtubeContentHtmlElementList);
    youtubeContentHtmlElementList = youtubeContentHtmlElementList.filter(youtubeContentHtmlElement => !isUnblurred(youtubeContentHtmlElement));
    let youtubeContentToFetchInfoList = getIdAndHtmlElement(youtubeContentHtmlElementList);
    let fetchedYoutubeContentInfoList = await fetchYoutubeContentInfo(youtubeContentToFetchInfoList).then();
    let youtubeContentDataList = generateYoutubeContentData(youtubeContentToFetchInfoList, fetchedYoutubeContentInfoList);
    let keywords = await getKeywords();
    handleYoutubeContent(youtubeContentDataList, keywords);
}

async function getKeywords() {
    let keywords = [];
    await new Promise(resolve => {
        chrome.storage.sync.get('keywords', value => {
            if (value.keywords) {
                keywords = value.keywords
            }
            resolve();
        });
    });
    return keywords;
}

function handleYoutubeContent(youtubeContentDataList, keywords) {
    youtubeContentDataList.forEach(data => {
        const keywordFound = checkVideoInfos(data.title, data.description, data.tags, keywords);
        if (keywordFound.length > 0) {
            data.htmlElement.classList.add("checked");
            const badge= createSpoiledElementBadge(keywordFound);
            const switchVisibilityButton = createSwitchVisibilityButton(data.htmlElement, badge);
            data.htmlElement.insertAdjacentElement('afterend', switchVisibilityButton);
            data.htmlElement.insertAdjacentElement('afterend', badge);
        } else {
            data.htmlElement.classList.add("checked");
            data.htmlElement.classList.add("unblurred");
            const badge = createSpoilerFreeBadge();
            data.htmlElement.appendChild(badge);
        }
    });
}

function generateYoutubeContentData(youtubeContentToFetchInfoList, fetchedYoutubeContentInfoList) {
    let youtubeContentData = [];
    fetchedYoutubeContentInfoList.forEach(data => {
        const htmlElement = youtubeContentToFetchInfoList.find(element => element.id === data.id).htmlElement;
        youtubeContentData.push({
            id: data.id,
            title: data.title,
            description: data.description,
            tags: data.tags,
            htmlElement: htmlElement})
    });
    return youtubeContentData;
}

async function fetchYoutubeContentInfo(youtubeContentToFetchInfoList) {
    let fetchedYoutubeContentInfoList;
    let youtubeContentListToFetchPack = [];
    let promises = [];
    for (let i = 0; i < youtubeContentToFetchInfoList.length ; i++) {
        youtubeContentListToFetchPack.push(youtubeContentToFetchInfoList[i]);
        if (youtubeContentListToFetchPack.length === MAX_REQUEST_PARAM_SIZE || i === youtubeContentToFetchInfoList.length - 1){
            promises.push(makeRequest(youtubeContentListToFetchPack));
            youtubeContentListToFetchPack = [];
        }
    }
    let results = await Promise.all(promises);
    fetchedYoutubeContentInfoList = results.flat();
    return fetchedYoutubeContentInfoList;
}

async function makeRequest(youtubeContentListToFetchPack) {
    let fetchedYoutubeContentInfoList = [];
    const requestParams = youtubeContentListToFetchPack.map(element => element.id).join(',');
    const requestUrl = API_URL + API_ENDPOINT + requestParams;
    await fetch(requestUrl)
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw errorData;
                });
            }
            return response.json()
        })
        .then(valueList => {
            valueList.forEach(value => fetchedYoutubeContentInfoList.push(value));
        })
        .catch(error => {
            console.error('Error', error);
        });
    return fetchedYoutubeContentInfoList;
}

function getIdAndHtmlElement(videoHtmlElementList) {
    let videoToFetch = [];
    getShorts(videoHtmlElementList).forEach(shorts => videoToFetch.push(shorts));
    videoHtmlElementList = videoHtmlElementList.filter(videoHtmlElement => !isShort(videoHtmlElement));
    getVideos(videoHtmlElementList).forEach(videos => videoToFetch.push(videos));
    videoHtmlElementList.filter(videoHtmlElement => !isVideo(videoHtmlElement));
    return videoToFetch;
}

function isShort(videoHtmlElement) {
    return videoHtmlElement.querySelector(THUMBNAIL_ANCHOR_SELECTOR).pathname.startsWith('/shorts/');
}

function isVideo(videoHtmlElement) {
    return new URLSearchParams(videoHtmlElement.querySelector(THUMBNAIL_ANCHOR_SELECTOR).search).has('v');
}

function getVideoId(videoHtmlElement) {
    return new URLSearchParams(videoHtmlElement.querySelector(THUMBNAIL_ANCHOR_SELECTOR).search).get('v');
}

function isChecked(videoHtmlElement) {
    return videoHtmlElement.classList.contains('checked');
}

function isUnblurred(videoHtmlElement) {
    return videoHtmlElement.classList.contains('unblurred');
}

function getShorts(videoHtmlElementList) {
    let shortsToFetch = [];
    videoHtmlElementList.forEach(videoHtmlElement => {
        if (isShort(videoHtmlElement)) {
            const id = videoHtmlElement.querySelector(THUMBNAIL_ANCHOR_SELECTOR).pathname.split('/')[2];
            shortsToFetch.push({ id: id, htmlElement: videoHtmlElement });
        }
    });
    return shortsToFetch;
}

function getVideos(videoHtmlElementList) {
    let videosToFetch = [];
    videoHtmlElementList.forEach(videoHtmlElement => {
        if (isVideo(videoHtmlElement)) {
            const id = getVideoId(videoHtmlElement);
            videosToFetch.push({ id: id, htmlElement: videoHtmlElement });
        }
    });
    return videosToFetch;
}

function unblurredClips(videoHtmlElementList) {
    videoHtmlElementList.forEach(videoHtmlElement => {
        if (videoHtmlElement.querySelector(THUMBNAIL_ANCHOR_SELECTOR).pathname.startsWith('/clip/')) {
            videoHtmlElement.classList.add("unblurred");
        }
    });
    return videoHtmlElementList;
}

function createSwitchVisibilityButton(element, badge) {
    const switchVisibilityButton = document.createElement('button');
    switchVisibilityButton.textContent = 'Show anyway';
    switchVisibilityButton.classList.add('switch-visibility-button');

    switchVisibilityButton.addEventListener('click', function () {
        if (!element.classList.contains("unblurred")) {
            element.classList.add("unblurred");
            switchVisibilityButton.textContent = 'Hide again';
            badge.style.visibility = 'hidden';
        }
        else {
            element.classList.remove("unblurred");
            switchVisibilityButton.textContent = 'Show anyway';
            badge.style.visibility = 'visible';
        }
    });
    return switchVisibilityButton;
}

function createSpoiledElementBadge(shouldBlur) {
    const badge = document.createElement('div');
    badge.textContent = `Spoiler for "${shouldBlur}"`;
    badge.classList.add('spoiled-element-badge');
    return badge;
}

function createSpoilerFreeBadge() {
    const badge = document.createElement('div');
    badge.classList.add('spoiler-free-badge');
    badge.textContent = 'Spoiler free';
    return badge;
}

function checkVideoInfos(title, description, tags, keywords) {
    let keyword;
    keyword = checkTitle(title, keywords);
    if (keyword.length > 0) {
        return keyword;
    }
    keyword = checkDescription(description, keywords);
    if (keyword.length > 0) {
        return keyword;
    }
    keyword = checkTags(tags, keywords);
    if (keyword.length > 0) {
        return keyword;
    }
    return '';
}

function checkTitle(title, keywords) {
    for (const keyword of keywords) {
        if (title.toLowerCase().includes(keyword)) {
            return keyword;
        }
    }
    return '';
}

function checkDescription(description, keywords) {
    for (const keyword of keywords) {
        if (description.toLowerCase().includes(keyword)) {
            return keyword;
        }
    }
    return '';
}

function checkTags(tags, keywords) {
    if (!tags) {
        return '';
    }
    for (const keyword of keywords) {
        if (tags.some(tag => tag.toLowerCase().includes(keyword))) {
            return keyword;
        }
    }
    return '';
}
