/**
 * To complete this Assignment follow below steps
 * 1.) Go to: OMDB website (https://www.omdbapi.com/)
 * 2.) In top navigation menu select "API Key"
 * 3.) Select Free account type and give your email address.
 * 4.) Go to your mail box and find the mail from OMDB.
 * 5.) You will receive the API Key in your mail along with a link to activate your key. Select the link to activate your key
 * 6.) Update the "myApiKey" variable with the API key from your mail. IMPORTANT: Before uploading your code to Github or Brightspace, delete your key from this file.
 * 7.) There are 3 task in this that you have to complete. Discuss with your instructor to understand the task.
 */

const myApiKey = ""; // <<-- ADD YOUR API KEY HERE. DELETE THIS KEY before uploading your code on Github or Brightspace, 

const BASE_URL = "https://www.omdbapi.com";


document.addEventListener('DOMContentLoaded', addEventHandlers);    // calling addEventHandlers function once the html document is loaded.

/**
 * Gets the value entered in the search bar and pass that value to getMovies function.
 */
function searchHandler() {
    const inputTxt = document.getElementById("searchBar").value;
    console.log(`Text Entered: ${inputTxt}`);
    if(inputTxt != "") {
        clearPreviousResult();
        getMovies(inputTxt);
    }
}

/**
 * Add event handler to search icon and search bar. When user click the search icon or when user
 * press "Enter" key while typing in search bar, "searchHandler" function will be called
 */
function addEventHandlers() {
    // handling search icon click event
    document.getElementById("searchIconDiv").addEventListener("click", searchHandler);

    // handling enter key press on search bar
    document.getElementById("searchBar").addEventListener("keydown", (event) => {
        if(event.key === 'Enter') {
            searchHandler();
        }
    });
}

/**
 * Remove all the elements from "movieCards" section
 */
function clearPreviousResult() {
    const nodes = document.getElementById("movieCards").childNodes;
    console.log(`clearPreviousResult: ${nodes.length}`);
    for(let i = nodes.length; i >= 0; i--) {
        nodes[i]?.remove();
    }
}

/**
 * Creates a new HTML element with optional classes and text content.
 *
 * @param {string} elementName - The tag name of the HTML element to create (e.g., 'div', 'p', 'img', 'h2').
 * @param {string[]} [classNames=[]] - An optional array of class names to add to the element.
 * @param {string} [contentText=''] - An optional string of text content to set for the element.
 * Note: For elements like 'img', 'input', etc., this will be ignored.
 * @returns {HTMLElement} The newly created HTML element.
 */
function createHtmlElement(elementName, classNames = [], contentText = '') {
    console.log(`CreateHtmlElement: ${elementName}`);
    const htmlElement = document.createElement(elementName);
    classNames.forEach(className => htmlElement.classList.add(className));
    htmlElement.innerHTML = contentText;
    return htmlElement;
}

/**
 * Perform a fetch operation to OMDB API to get list of movies based on movieTitle user provided
 * 
 * @param {string} movieTitle - String user entered in the search bar.
 */
async function getMovies(movieTitle) {
    const API_URL = `${BASE_URL}/?apikey=${myApiKey}&s=${movieTitle}`;

    try {
        const response = await fetch(API_URL);

        if(response.ok) {
            const data = await response.json();
            const movieList = data.Search;

            if(movieList == null || movieList.length == 0) {
                createEmptyView();
                return;
            }

            // check the Poster URL, if poster url is not correct, do not create movie card.
            const moviePromises = movieList.map(movie => checkPosterURL(movie));
            const results = await Promise.allSettled(moviePromises);

            const filteredMovies = [];
            results.forEach(result => {
                if(result.status === "fulfilled" && result.value != null) {
                    const movieObj = result.value;
                    movieObj.Title = movieObj.Title.length > 40 ? `${movieObj.Title.substring(0,40)}...` : movieObj.Title;
                    filteredMovies.push(movieObj);
                }
            });

            console.log("Final movie list: ");
            console.log(filteredMovies);

            if (filteredMovies.length === 0) {
                createEmptyView();
            } else {
                filteredMovies.forEach(movie => createMovieCard(movie));
            }
        }
    } catch(exception) {
        console.error("Exception occurred in getMovies function.");
        console.error(exception);
    }
}

/**
 * Check the url of movie poster. If poster url is working then only we will create movie card.
 * 
 * @param {object} movie - The movie object from the list of movies received from OMDB API.
 * @returns {object || null} movie object if the poster url is working, null if poster url is not working
 */
async function checkPosterURL(movie) {
    try {
        const response = await fetch(movie.Poster);
        if(response.ok) {
            return movie;
        } else {
            return null;
        }
    } catch(error) {
        console.error("Error while checking poster url");
        console.error(error);
        return null;
    }
}

/**
 * If the search operation does not create any movie card, call this method to create empty view. 
 * Create a "p" element and append it to "movieCards" section.
 * 
 *      <p class="noresult">No movie found!!! Please search for another title.</p>
 */
function createEmptyView() {
    console.log("createEmptyView");

    const container = document.getElementById("movieCards");
    const message = document.createElement('p');
    message.classList.add('noresult');
    message.textContent = "No movie found!!! Please search for another title.";
    container.appendChild(message);
}

/**
 * Create a movie card using the parameter. The card should have movie title and poster. The card should follow below structure:
 *      <article class="card">
 *          <p class="cardTitle">movie.Title</p>
 *          <div class="cardPosterDiv">
 *              <img class="moviePoster" src=movie.Poster alt="Movie poster">
 *          </div>
 *      </article>
 * 
 * @param {object} movie - The movie object from filteredMovie. The movie object will have a Title and a Poster url.
 */
function createMovieCard(movie) {
    console.log("createMovieCard");
    console.log(movie);

    const container = document.getElementById("movieCards");

    // Create article with class 'card'
    const article = document.createElement('article');
    article.classList.add('card');

    // Create paragraph for title
    const title = document.createElement('p');
    title.classList.add('cardTitle');
    title.textContent = movie.Title;

    // Create div for poster with class 'cardPosterDiv'
    const posterDiv = document.createElement('div');
    posterDiv.classList.add('cardPosterDiv');

    // Create img element for poster
    const posterImg = document.createElement('img');
    posterImg.classList.add('moviePoster');
    posterImg.src = movie.Poster;
    posterImg.alt = "Movie poster";

    // Append img to posterDiv, then append title and posterDiv to article
    posterDiv.appendChild(posterImg);
    article.appendChild(title);
    article.appendChild(posterDiv);

    // Append article to container
    container.appendChild(article);
}
