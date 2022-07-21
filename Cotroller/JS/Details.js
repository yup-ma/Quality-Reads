let searchedObjectId = "";
let timeMSUnitsObject = {
    min: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    month: 24 * 60 * 60 * 1000 * 365 / 12,
    year: 24 * 60 * 60 * 1000 * 365
}
let currentTimeStampVar;
let apiUrlForArticles = `http://hn.algolia.com/api/v1/items/${searchedObjectId}`;

window.addEventListener("load", () => {
    if (window.location.href.split('?').length > 1) {
        if (window.location.href.split('?')[1].split('object_id=').length > 1) {
            searchedObjectId = window.location.href.split('?')[1].split('object_id=')[1];
        }
    }
    if (searchedObjectId == "" || searchedObjectId == null) {
        if (localStorage.getItem("searched-article-id")) {
            searchedObjectId = localStorage.getItem("searched-article-id");
        } else {
            searchedObjectId = "";
        }
        window.location.replace(`../Template/Details.html?object_id=${searchedObjectId}`);
    }
    apiUrlForArticles = `http://hn.algolia.com/api/v1/items/${searchedObjectId}`;
    apiRunningFunc(apiUrlForArticles)
})


function apiRunningFunc(e) {
    fetch(e)
        .then(response => response.json())
        .then((jsonData) => {
            articleCreatorFunc(jsonData);
        })
        .catch((error) => {
            document.querySelector("main").innerHTML = `<div class="fetch-api-error-container d-flex d-flex-just-cent">
            <img src="../Images/error-occured-image.svg">
            <p>Unexpected error :( , we are doing our best to resolve<br>Try to <button onclick="location.reload();">Reload</button> page<br><br><a href="../Template/Index.html">Go to home page</a></p>
        </div>`
        });
}

function articleCreatorFunc(jsonData) {
    let articleTitle = jsonData.title;
    let articleCommentTitle = "";
    let pointsAmount = jsonData.points;
    if (articleTitle == null) {
        if (jsonData.text !== null) {
            if (jsonData.type == "comment") {
                articleTitle = "Comment: " + removingParagraphTag(jsonData.text).substring(0, 50).trim() + "...";
                articleCommentTitle = jsonData.text;
            } else {
                articleTitle = "Poll option: " + removingParagraphTag(jsonData.text);
            }
        } else {
            articleTitle = "Couldn't find title";
        }
    }
    if (pointsAmount == null) {
        pointsAmount = 0;
    }
    document.querySelector("main").innerHTML = `<div class="article-main-container d-flex d-flex-dir-col">
        <div class="article-main-container-top-section d-flex d-flex-dir-col">
            <span class="article-type-container">${jsonData.type}</span>
            <h1 class="article-title-container" title="${articleCommentTitle}">${articleTitle}</h1>
            <h3 class="d-flex">
                <span class="article-creating-date-container">${articleDateConverterFunc(jsonData.created_at)}</span>
                <span class="dot"><i class="fa-solid fa-circle"></i></span>
                <span class="article-author-container">${jsonData.author}</span>
            </h3>
            <div class="article-main-container-top-section-extra-info d-flex">
                <div class="articles-container-info articles-container-info-points d-flex">
                    <span class="articles-container-info-icon"><i class="fa-solid fa-coins"></i></span>
                    <span class="articles-container-info-details d-flex d-flex-dir-col">
                        <span>Point</span>
                        <span>${pointsAmount}</span>
                    </span>
                </div>
                <div class="articles-container-info articles-container-info-comments d-flex">
                    <span class="articles-container-info-icon"><i class="fa-solid fa-message"></i></span>
                    <span class="articles-container-info-details d-flex d-flex-dir-col">
                        <span>Comment</span>
                        <span class="comment-amount">0</span>
                    </span>
                </div>
            </div>
            <div class="article-extra-details-container">
            </div>
        </div>

        <div class="article-main-container-comment-section">
            <h3 class="articles-main-container-heading">Comment(s)</h3>
            <div class="article-coments-main-container">
                <ul>
                </ul>
            </div>
        </div>
    </div>`

    if (jsonData.type == "story") {
        if (jsonData.url !== null) {
            document.querySelector(".article-extra-details-container").innerHTML = `<a href="${jsonData.url}" target="_blank">Read article <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
        } else {
            document.querySelector(".article-extra-details-container").style.display = "none";
        }
    } else if (jsonData.type == "poll") {
        if (jsonData.options.length > 0) {
            document.querySelector(".article-extra-details-container").innerHTML = `<div class="option-container d-flex d-flex-dir-col">Option(s)<div class="option-btn-container d-flex"></div></div>`;
            jsonData.options.forEach(ele => {
                const newButton = document.createElement("button");
                newButton.innerHTML = removingParagraphTag(ele.text);
                document.querySelector(".option-btn-container").appendChild(newButton);
            });
        } else {
            document.querySelector(".article-extra-details-container").style.display = "none";
        }
    } else {
        document.querySelector(".article-extra-details-container").style.display = "none";
    }

    currentTimeStampVar = new Date().getTime()
    if (jsonData.children.length > 0) {
        document.querySelector(".article-coments-main-container ul")
        addingCommentsToArticleFunc(document.querySelector(".article-coments-main-container ul"), jsonData.children)
    } else {
        document.querySelector(".article-coments-main-container").innerHTML = `<div class="fetch-api-error-container d-flex d-flex-just-cent">
        <img src="../Images/no-comments-found.svg">
        <p>Opps, Couldn't find any comment</a>
    </div>`;
    }
    document.querySelector(".comment-amount").innerHTML = document.querySelectorAll("li").length
    // document.querySelector(".comment-amount").innerHTML = document.querySelectorAll(".comment-info").length
}

function removingParagraphTag(e) {
    return e.replace("<p>", "").replace("</p>", "")
}

function addingCommentsToArticleFunc(container, commentsArray) {
    commentsArray.forEach(ele => {
        let commentPointsAmt = ele.points;
        if (ele.author == null) {
            return
        } else if (ele.text == null) {
            return
        }
        if (ele.points == null) {
            commentPointsAmt = 0;
        }
        const newLi = document.createElement("li");
        const newDiv1 = document.createElement("div");
        const newP = document.createElement("p");
        const newButton = document.createElement("button");
        const newDiv2 = document.createElement("div");
        newDiv1.className = "comment-info";
        newDiv1.innerHTML = `<span>${ele.author}</span><span title="Points: ${commentPointsAmt}">Pts: <b>${commentPointsAmt}</b></span><span>${commentTimestampCreatorFunc(ele.created_at_i)} ago</span>`;
        newP.className = "comment-paragraph";
        newP.innerHTML = ele.text;
        newLi.appendChild(newDiv1);
        newLi.appendChild(newP);
        if (ele.children.length > 0) {
            newButton.innerHTML = `<i class="fa-solid fa-reply"></i> Replies`;
            newDiv2.className = "sub-level-comment";
            newButton.addEventListener('click', showMoreRepliesBtnFunc)
            newLi.appendChild(newButton);
            newLi.appendChild(newDiv2);
            addingCommentsToArticleFunc(newDiv2, ele.children);
        }
        container.appendChild(newLi);
    });
}

function showMoreRepliesBtnFunc() {
    if (this.classList.contains("active")) {
        this.classList.remove("active");
        this.parentElement.querySelector(".sub-level-comment").style.display = "none";
        this.innerHTML = `<i class="fa-solid fa-reply"></i> Replies`;
    } else {
        this.classList.add("active");
        this.parentElement.querySelector(".sub-level-comment").style.display = "block";
        this.innerHTML = `<i class="fa-solid fa-reply"></i> Collapse`;
    }
}

function commentTimestampCreatorFunc(commentTimeStampVar) {
    let timePassedSinceComment = currentTimeStampVar - commentTimeStampVar * 1000;
    if (timePassedSinceComment < timeMSUnitsObject.min) {
        return Math.floor(timePassedSinceComment / 1000) + ' sec';
    } else if (timePassedSinceComment < timeMSUnitsObject.hour) {
        return Math.floor(timePassedSinceComment / timeMSUnitsObject.min) + ' min';
    } else if (timePassedSinceComment < timeMSUnitsObject.day) {
        if (Math.floor(timePassedSinceComment / timeMSUnitsObject.hour) > 1) {
        return Math.floor(timePassedSinceComment / timeMSUnitsObject.hour) + ' hours';
        } else {
        return Math.floor(timePassedSinceComment / timeMSUnitsObject.hour) + ' hour';
        }
    } else if (timePassedSinceComment < timeMSUnitsObject.month) {
        if (Math.floor(timePassedSinceComment / timeMSUnitsObject.day) > 1) {
            return Math.floor(timePassedSinceComment / timeMSUnitsObject.day) + ' days';
        } else {
            return Math.floor(timePassedSinceComment / timeMSUnitsObject.day) + ' day';
        }
    } else if (timePassedSinceComment < timeMSUnitsObject.year) {
        if (Math.floor(timePassedSinceComment / timeMSUnitsObject.month) > 1) {
            return Math.floor(timePassedSinceComment / timeMSUnitsObject.month) + ' months';
        } else {
            return Math.floor(timePassedSinceComment / timeMSUnitsObject.month) + ' month';
        }
    } else {
        if (Math.floor(timePassedSinceComment / timeMSUnitsObject.year) > 1) {
            return Math.floor(timePassedSinceComment / timeMSUnitsObject.year) + ' years';
        } else {
            return Math.floor(timePassedSinceComment / timeMSUnitsObject.year) + ' year';
        }
    }
}