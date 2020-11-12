// function onload() {
//     console.log("hi");
// }

// const { debug } = require("console");

// let grid = {
//     size: GRID_SIZE.small
// };
// let GRID_SIZE = {
//     small: 'small',
//     medium: 'medium',
//     large: 'large'
// };

// TODO: Get these out of here.
// const FETCH_IMAGES_URL = "http://localhost:5001/js-matching-game/us-central1/fetchImages"
const FETCH_IMAGES_URL = "https://us-central1-js-matching-game.cloudfunctions.net/fetchImages"
let rows = 4;
let cols = 4;
let isLoading = false;
let numMoves = 0;
let numMatches = 0;
let numMatchesRemaining = 0;
let card1 = null;
let card2 = null;
let canInteract = true;

function init() {
    var numImages = (rows * cols) / 2

    resetStats()
    resetGameBoard()

    fetchImages(numImages)
}

function fetchImages(number) {
    setLoading(true);

    fetch(`${FETCH_IMAGES_URL}?count=${number}`)
    .then(res => res.json())
    .then(data => {
        buildGrid(data);
        setLoading(false);
    })
    .catch(err => {
        console.log('Error happened during fetching!', err);
        setLoading(false);
    });
}

function buildGrid(data) {
    let expected = (rows * cols) / 2
    let actual = data.length

    if (expected == actual) {
        let gridHtml = "";
        let index = 0;

        // Add duplicates so they can be matched
        let cardsAndMatches = data.concat(data)
        let shuffledCards = shuffle(cardsAndMatches)

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                gridHtml += '<div class="card-container">';
                gridHtml +=   `<div class="card" data-id="${shuffledCards[index].id}" onclick=cardClicked(event)>`;
                gridHtml +=     '<div class="side front"></div>'
                gridHtml +=     '<div class="side back">';
                gridHtml +=       `<img src=${shuffledCards[index].urls.small}">`;
                gridHtml +=     '</div>';
                gridHtml +=   '</div>'
                gridHtml += '</div>'

                index++;
            }
        }
        let grid = document.getElementById('grid');
        grid.innerHTML = gridHtml;
        grid.classList.remove('hidden');
        grid.classList.add('small');
    }
}

function setLoading(isLoading) {
    var loader = document.getElementById("loader");
    let grid = document.getElementById('grid');

    if (isLoading) {
        loader.classList.remove('hidden');
        grid.classList.add('hidden');
    } else {
        loader.classList.add('hidden');
        grid.classList.remove('hidden');
    }
}

function cardClicked(event) {
    handleClickEvent(event.currentTarget);
}

function handleClickEvent(elCard) {
    // Don't handle clicking cards that are already cleared, or if we are transitioning a flip
    if (!canInteract || elCard.classList.contains('flipped') || elCard.classList.contains('cleared')) { 
        console.log('nope');
        return;
    }

    var id = elCard.getAttribute('data-id');
    elCard.addEventListener('transitionend', transitionDidEnd);
    elCard.classList.add('flipped');
    canInteract = false

    if (!card1) {
        card1 = {
            element: elCard,
            id: id
        };
    } else {
        card2 = {
            element: elCard,
            id: id
        };
    }
}

function transitionDidEnd(event) {
    checkForMatch(card1, card2)
    event.currentTarget.removeEventListener('transitionend', transitionDidEnd)
    canInteract = true;
}

function checkForMatch(card1, card2) {
    if (card1 && card2) {
        // Check for match
        if (card1.id == card2.id) {
            // MATCH! 
            resetFlippedCards(true)
            numMatches++;
            numMatchesRemaining--;
        } else {
            // No match. Flip both back
            resetFlippedCards(false)
        }
        numMoves++;

        updateStats()
    }
}

function resetFlippedCards(wasMatch) {
    if (wasMatch) {
        card1.element.classList.add('cleared');
        card2.element.classList.add('cleared');
        card1.element.remove();
        card2.element.remove();    
        checkForGameOver()
    } else {
        // No match. Flip both back
        card1.element.classList.remove('flipped');
        card2.element.classList.remove('flipped');
    }

    card1 = null;
    card2 = null;
};

function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
}

function resetGameBoard() {
    let grid = document.getElementById('grid');
    grid.innerHTML = ""
}

function updateStats() {
    document.getElementById('num-moves').innerText = numMoves
    document.getElementById('num-matches').innerText = numMatches
    document.getElementById('num-matches-remaining').innerText = numMatchesRemaining
}

function resetStats() {
    numMoves = 0
    numMatches = 0
    numMatchesRemaining = (rows * cols) / 2
}

function checkForGameOver() {
    if (numMatchesRemaining == 0) {
        document.getElementById('game-over').classList.remove('hidden')
        document.getElementById('num-moves-end').innerText = numMoves
    }
}

function newGame() {
    resetStats()
    resetGameBoard()

    fetchImages(numImages)
}
// addEventListener('click', event => {
//     console.log(`clicked: ${event.target.tagName}`);
//     if (event.target.tagName.toLowerCase() == 'img') {
//         handleClickEvent(event.target.parentElement)
//     }
// });

