import { solutions } from "/solutions.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = solutions[Math.floor(Math.random() * solutions.length)];
// game colours
let position = '#EDAE49';
let correct = '#44CF6C';
let banned = '#FF1B1C';
let broke = '#5F634F';
//console.log(rightGuessString);

// set up notification style
toastr.options = {
  "progressBar": true,
  "positionClass": "toast-top-full-width"
}

// toggle in frontend for "Scrabble Datiddle"






// create letter points array
let scrabbleLetters = {
  1 : ['a','e','i','o','u','l','n','s','t','r'],
  2 : ['d','g'],
  3 : ['b','c','m','p'],
  4 : ['f','h','v','w','y'],
  5 : ['k'],
  8 : ['j','x'],
  10 : ['q','z']
}

// create helper object to get point value for each letter
let letterPointObj = {};
for(var pointValue in scrabbleLetters) { 
  let lettersArray = scrabbleLetters[pointValue];
  for(var letter of lettersArray) { 
    letterPointObj[letter] = Number(pointValue);
  }
}  

// temp: calculate points per solution word
/*let charPoints = 0;
let pointAvg = 0;
let avgArr = [];
for(const word of solutions) {
  for(const char of word) {
    charPoints = Number(letterPointObj[char]);
    pointAvg += charPoints;
  }
  avgArr.push([word,pointAvg]);
  pointAvg = 0;
}
console.table(avgArr);*/



//console.log('solution:',rightGuessString);
let pointBalance = 0;

// alternative mode: calculate available points for player
/*for (let i = 0; i < 5; i++) {
  let char = rightGuessString[i];
  let pointVal = letterPointObj[char];
  pointBalance += pointVal;
}*/
pointBalance = 39;
console.log('pointBal:',pointBalance);


function initBoard() {
  let board = document.getElementById("game-board");

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }

    board.appendChild(row);
  }
}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor;
      if (oldColor === correct) {
        return;
      }

      if (oldColor === position && color !== correct) {
        return;
      }

      elem.style.backgroundColor = color;
      break;
    }
  }
}

function deleteLetter() {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter - 1];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
  nextLetter -= 1;
}

function checkGuess() {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let guessString = "";
  let rightGuess = Array.from(rightGuessString);

  // when each guess is submitted, subtract the total points used

  for (const val of currentGuess) {
    guessString += val;
  }

  if (guessString.length != 5) {
    toastr.warning("Not enough letters!");
    return;
  }

  /* if (!solutions.includes(currentGuess.join(""))) {
    toastr.error("Word not in list!");
    return;
  } */

  var letterColor = ["gray", "gray", "gray", "gray", "gray"];

  //check correct
  for (let i = 0; i < 5; i++) {
    if (rightGuess[i] == currentGuess[i]) {
      letterColor[i] = correct;
      rightGuess[i] = "#";
    }
  }

  //check position
  //checking guess letters
  for (let i = 0; i < 5; i++) {
    if (letterColor[i] == correct) continue;

    //checking right letters
    for (let j = 0; j < 5; j++) {
      if (rightGuess[j] == currentGuess[i]) {
        letterColor[i] = position;
        rightGuess[j] = "#";
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    let box = row.children[i];
    let delay = 250 * i;
    setTimeout(() => {
      //flip box
      animateCSS(box, "flipInX");
      //shade box
      box.style.backgroundColor = letterColor[i];
      shadeKeyBoard(guessString.charAt(i) + "", letterColor[i]);
    }, delay);
  }
  
  let forbiddenWords = ['matty','shoes','first'];

  if (forbiddenWords.includes(currentGuess.join(""))) {
    toastr.error("You used a forbidden word! Game over!");
    toastr.info(`The right word was: "${rightGuessString.toUpperCase()}"`);
    guessesRemaining = 0;
    
    for (let i = 0; i < 5; i++) {
      letterColor[i] = banned;
    }

    return;
  }

  // subtract currentGuess from point balance
  for (let i = 0; i < 5; i++) {
    let char = currentGuess[i];
    let pointVal = letterPointObj[char];
    pointBalance -= pointVal;
  }
  console.log('pointBal:',pointBalance);

  // check on each guess if points remaining >= 0
  // if points remaining < 0 then FAILURE
  if (pointBalance < 0) {
    toastr.error("You ran out of points! Game over!");
    toastr.info(`The right word was: "${rightGuessString.toUpperCase()}"`);
    guessesRemaining = 0;
    for (let i = 0; i < 5; i++) {
      letterColor[i] = broke;
    }
    return;
  }

  if (guessString === rightGuessString) {
    toastr.success("You guessed right! Game over!");
    guessesRemaining = 0;
    return;
  } else {
    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 1) {
      toastr.warning("Only 1 guess left! Make it count!")
    }

    if (guessesRemaining === 0) {
      toastr.error("You've run out of guesses! Game over!");
      toastr.info(`The right word was: "${rightGuessString}"`);
    }
  }
}

function insertLetter(pressedKey) {
  if (nextLetter === 5) {
    return;
  }
  pressedKey = pressedKey.toLowerCase();

  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter];
  animateCSS(box, "pulse");
  box.textContent = pressedKey;
  box.classList.add("filled-box");
  currentGuess.push(pressedKey);
  nextLetter += 1;
}

const animateCSS = (element, animation, prefix = "animate__") =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element;
    node.style.setProperty("--animate-duration", "0.3s");

    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });

document.addEventListener("keyup", (e) => {
  if (guessesRemaining === 0) {
    return;
  }

  let pressedKey = String(e.key);
  if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter();
    return;
  }

  if (pressedKey === "Enter") {
    checkGuess();
    return;
  }

  let found = pressedKey.match(/[a-z]/gi);
  if (!found || found.length > 1) {
    return;
  } else {
    insertLetter(pressedKey);
  }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("keyboard-button")) {
    return;
  }
  let key = target.textContent;

  if (key === "Del") {
    key = "Backspace";
  }

  document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

initBoard();
