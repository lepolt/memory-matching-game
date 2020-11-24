
let GRID_SIZE = {
    small: {
        name: 'small',
        rows: 4,
        cols: 4
    },
    medium: {
        name: 'medium',
        rows: 4,
        cols: 5        
    },
    large: {
        name: 'large',
        rows: 6,
        cols: 6        
    }
};

// TODO:
// const FETCH_IMAGES_URL = "http://localhost:5001/js-matching-game/us-central1/fetchImages"
const FETCH_IMAGES_URL = "https://us-central1-js-matching-game.cloudfunctions.net/fetchImages"
let gridSize = GRID_SIZE.small
let isLoading = false;
let numMoves = 0;
let numMatches = 0;
let numMatchesRemaining = 0;
let card1 = null;
let card2 = null;
let canInteract = true;

function init() {
    document.getElementById('board-size-select').addEventListener('input', boardSizeChanged);
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
    var rows = gridSize.rows;
    var cols = gridSize.cols;
    let expected = getExpectedMatches();
    let actual = data.length;

    if (expected == actual) {
        let gridHtml = "";
        let index = 0;

        // Add duplicates so they can be matched
        let cardsAndMatches = data.concat(data);
        let shuffledCards = shuffle(cardsAndMatches);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                // Build a URL to load
                var url = `${shuffledCards[index].photo_image_url}?fit=crop&crop=entropy&h=400&w=400`;
                gridHtml += '<div class="card-container">';
                gridHtml +=   `<div class="card" data-id="${shuffledCards[index].photo_id}" onclick=cardClicked(event)>`;
                gridHtml +=     '<div class="side front"></div>'
                gridHtml +=     '<div class="side back">';
                gridHtml +=       `<img src=${url}">`;
                gridHtml +=     '</div>';
                gridHtml +=   '</div>'
                gridHtml += '</div>'

                index++;
            }
        }
        let game = document.getElementById('game');
        game.insertAdjacentHTML('afterbegin', gridHtml);
        game.classList.remove('hidden');

        // Remove old size classes
        for (obj in Object.keys(GRID_SIZE)) {
            game.classList.remove(obj.name);
        }
        // Add new size
        game.classList.add(gridSize.name);
    }
}

function setLoading(isLoading) {
    var loader = document.getElementById("loader");
    let game = document.getElementById('game');

    if (isLoading) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

function cardClicked(event) {
    handleClickEvent(event.currentTarget);
}

function handleClickEvent(elCard) {
    // Don't handle clicking cards that are already cleared, or if we are transitioning a flip
    if (!canInteract || elCard.classList.contains('flipped') || elCard.classList.contains('cleared')) { 
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
        checkForGameOver()
    }
}

function resetFlippedCards(wasMatch) {
    if (wasMatch) {
        card1.element.classList.add('cleared');
        card2.element.classList.add('cleared');
        card1.element.remove();
        card2.element.remove();    
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

function removeCards() {
    let game = document.getElementById('game');
    let oldCards = document.querySelectorAll('#game .card-container')
    if (oldCards && oldCards.length) {
        oldCards.forEach(card => {
            card.remove();    
        });
    }
}

function resetGameBoard() {
    document.getElementById('new-game').classList.add('hidden');
    document.getElementById('msg-new-game').classList.add('hidden');
    document.getElementById('msg-game-over').classList.add('hidden');
}

function updateStats() {
    document.getElementById('num-moves').innerText = numMoves
    document.getElementById('num-matches').innerText = numMatches
    document.getElementById('num-matches-remaining').innerText = numMatchesRemaining
}

function resetStats() {
    numMoves = 0;
    numMatches = 0;
    numMatchesRemaining = getExpectedMatches();
}

function checkForGameOver() {
    if (numMatchesRemaining == 0) {
        removeCards()

        document.getElementById('new-game').classList.remove('hidden');
        document.getElementById('msg-game-over').classList.remove('hidden');
        document.getElementById('num-moves-end').innerText = numMoves;
    }
}

function newGame() {
    resetStats();
    resetGameBoard();

    var numImages = getExpectedMatches()
    fetchImages(numImages);
}

function boardSizeChanged(/* event */) {
    let select = document.getElementById('board-size-select')
    gridSize = GRID_SIZE[select.value]
}

function getExpectedMatches() { 
    return (gridSize.rows * gridSize.cols) / 2;
}