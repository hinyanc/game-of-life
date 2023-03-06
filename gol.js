const unitLength = 35; // grid size
const boxColor = "#8a2ba2"; // grid w/ life color
const strokeColor = 255; //
let columns; /* To be determined by window width */
let rows; /* To be determined by window height */
let currentBoard;
let nextBoard;
let startAgain = true; // to initiate pause / cont btn
let colorPicker;
let boxColorOp = 1;
let nb;
let rp;

let dieOfLoneliness;
let dieOfOverpopulation;
let newLife;

let randomColFlag = false;

function setup() {
  /* Set the canvas to be under the element #canvas*/
  const canvas = createCanvas(windowWidth * 0.9, windowHeight / 2);
  canvas.parent(document.querySelector("#canvas"));

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);

  /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  currentBoard = [];
  nextBoard = [];
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = [];
    nextBoard[i] = [];
  }

  // Now both currentBoard and nextBoard are array of array of undefined values.
  initWithFeatures(); // Set the initial values of the currentBoard and nextBoard
}

function windowResized() {
  // -----pending-----

  canvas = createCanvas(windowWidth * 0.9, windowHeight / 2);
  canvas.parent(document.querySelector("#canvas"));

  /*Calculate the number of columns and rows */
  columns = floor(width / unitLength);
  rows = floor(height / unitLength);

  /*Making both currentBoard and nextBoard 2-dimensional matrix that has (columns * rows) boxes. */
  newCurrentBoard = [...currentBoard];
  newNextBoard = [...nextBoard];
  console.log(newCurrentBoard, "||", newNextBoard);
  for (let i = 0; i < columns; i++) {
    currentBoard[i] = newCurrentBoard[i] ?? Array(rows).fill(0);
    nextBoard[i] = newNextBoard[i] ?? Array(rows).fill(0);
  }
}

function initWithFeatures() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      currentBoard[i][j] = 0;
      nextBoard[i][j] = 0;
    }
  }
  addFeatures();
}

function init() {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      // default version
      currentBoard[i][j] = 0;
      nextBoard[i][j] = 0;

      // object version
      // currentBoard[i][j] = {
      //   color: "#000000",
      //   life: 0,
      // };
      // nextBoard[i][j] = {
      //   color: "#000000",
      //   life: 0,
      // };
    }
  }
}

function addFeatures() {
  // create slider of speed control
  sliderSpeed = createSlider(1, 30, 15); // min, max, start point
  // slider.position(300, 180);
  sliderSpeed.size(300, 10);
  sliderSpeed.addClass("slider");
  sliderSpeed.parent(document.querySelector("#slider-speed"));

  // create color picker
  colorPicker = createColorPicker("#8a2ba2");
  colorPicker.position(0, height + 5);
  colorPicker.addClass("color-picker");
  colorPicker.parent(document.querySelector(".color-gp"));
}

let counter = 0;
function draw() {
  counter = 0;
  let factor = Math.sin(counter);
  dieOfLoneliness = document.getElementsByClassName("lonely").value;
  dieOfOverpopulation = document.getElementsByClassName("overp").value;
  newLife = document.getElementsByClassName("rp").value;
  let speed = sliderSpeed.value();
  frameRate(speed); // frame rate speed based on slider
  background(204, 167, 239); // bg color (behind grid)
  generate();
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      if (currentBoard[i][j] > 0) {
        if (currentBoard[i][j] == 1) {
          if (randomColFlag == true) {
            let r = Math.floor(Math.random() * 256);
            let g = Math.floor(Math.random() * 256);
            let b = Math.floor(Math.random() * 256);
            fill(r, g, b);

            // fill(currentBoard[i][j].color);
          } else if (randomColFlag == false) {
            fill(colorPicker.color());
          }
          // stable life
          if (currentBoard[i][j] == nextBoard[i][j]) fill([0, 0, 0]);
          counter += 1;
          document.querySelector("#counter").innerHTML = counter;
        }
      } else {
        fill(204, 167, 239); // grid w/o life color
      }

      stroke(strokeColor);
      circle(
        i * unitLength,
        j * unitLength,
        unitLength * factor,
        Math.max(unitLength * factor, unitLength * 0.5)
      );
    }
  }
}

function generate() {
  //Loop over every single box on the board
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Count all living members in the Moore neighborhood(8 boxes surrounding)
      let neighbors = 0;
      for (let i of [-1, 0, 1]) {
        for (let j of [-1, 0, 1]) {
          if (i == 0 && j == 0) {
            // the cell itself is not its own neighbor
            continue;
          }
          // The modulo operator is crucial for wrapping on the edge
          neighbors +=
            currentBoard[(x + i + columns) % columns][(y + j + rows) % rows] ??
            0;
        }
      }

      dieOfLoneliness = document.getElementById("lonely").value;
      dieOfOverpopulation = document.getElementById("overp").value;
      newLife = document.getElementById("rp").value;
      let a = parseInt(dieOfLoneliness);
      let b = parseInt(dieOfOverpopulation);
      let c = parseInt(newLife);

      // console.log("check in gen a,b,c", a, b, c);

      // Rules of Life
      if (currentBoard[x][y] == 1 && neighbors < a) {
        // Die of Loneliness
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] == 1 && neighbors > b) {
        // Die of Overpopulation
        nextBoard[x][y] = 0;
      } else if (currentBoard[x][y] == 0 && neighbors == c) {
        // New life due to Reproduction
        nextBoard[x][y] = 1;
      } else {
        // Stasis
        nextBoard[x][y] = currentBoard[x][y];
      }
    }
  }

  // Swap the nextBoard to be the current Board
  [currentBoard, nextBoard] = [nextBoard, currentBoard];
}

/**
 * When mouse is dragged
 */
function mouseDragged() {
  /**
   * If the mouse coordinate is outside the board
   */
  if (
    mouseX > unitLength * columns ||
    mouseY > unitLength * rows ||
    mouseX < 0 ||
    mouseY < 0
  ) {
    return;
  }

  const x = Math.max(Math.floor(mouseX / unitLength), 0);
  const y = Math.max(Math.floor(mouseY / unitLength), 0);

  // for debug. delete after use.
  // console.log(`mouseX: ${mouseX}; mouseY: ${mouseY}`);
  // console.log(`x: ${x}, y: ${y}`);
  // console.log("mouseDragged - currentBorad:");
  // console.log(currentBoard);

  currentBoard[x][y] = 1;
  fill(colorPicker.color());
  stroke(strokeColor);
  circle(x * unitLength, y * unitLength, unitLength, unitLength);
}

// choose pattern button
let patternChoose = document.getElementById("pattern");

// pause & continue button
let controlGame = document.getElementById("pause");
controlGame.addEventListener("click", () => {
  startAgain = !startAgain;
  if (startAgain !== false) {
    noLoop();
    controlGame.innerHTML = "Continue";
    console.log(startAgain);
  } else {
    loop();
    controlGame.innerHTML = "Pause";
    console.log(startAgain);
  }
});

// random button
let randomPlay = document.getElementById("random");
randomPlay.addEventListener("click", () => {
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      // let someVariables = <conditions> : <when_true> : <when_false>;
      currentBoard[i][j] = Math.random() > 0.8 ? 1 : 0; // one line if
      nextBoard[i][j] = 0;
    }
  }
  loop();
});

// random color button
let randomColor = document.getElementById("randomColor");
randomColor.addEventListener("click", () => {
  if (randomColFlag == false) {
    randomColFlag = true;
    console.log("change to true");
  } else if (randomColFlag == true) {
    randomColFlag = false;
    console.log("change to false");
  }
});

// restart button
let reset = document.getElementById("restart");
reset.addEventListener("click", () => {
  init();
  startAgain = true;
  loop();
  controlGame.innerHTML = "Start";
});

/**
 * When mouse is pressed
 */
function mousePressed() {
  noLoop();
  const pattern = document.querySelector("#pattern").value;
  if (pattern !== "none") {
    console.log("selected pattern: ", pattern);
    patternStamp();
  } else {
    mouseDragged();
  }
}

/**
 * When mouse is released
 */
function mouseReleased() {
  noLoop();
  if (startAgain !== true) {
    loop();
  }
}

// print pattern
function patternStamp() {
  /**
   * If the mouse coordinate is outside the board
   */
  if (
    mouseX > unitLength * columns ||
    mouseY > unitLength * rows ||
    mouseX < 0 ||
    mouseY < 0
  ) {
    return;
  }

  const x = Math.max(Math.floor(mouseX / unitLength), 0);
  const y = Math.max(Math.floor(mouseY / unitLength), 0);

  const pattern = document.querySelector("#pattern").value;
  if (pattern == "1") {
    const specifiedPattern = patterns[Number(pattern)];
    console.log("spc. pattern: ", specifiedPattern);
    for (let i = 0; i < specifiedPattern.length; i++) {
      for (let j = 0; j < specifiedPattern[i].length; j++) {
        currentBoard[x + j][y + i] = specifiedPattern[i][j];
        console.log(currentBoard[x + j][y + i]);
        if (currentBoard[x + j][y + i]) fillColor(x + j, y + i);
      }
    }
  } else if (pattern == "2") {
    console.log("pattern 2");
  }
  // currentBoard[x][y] = 1;
  // fill(colorPicker.color());
  // stroke(strokeColor);
  // circle(x * unitLength, y * unitLength, unitLength, unitLength);
}

function fillColor(x, y) {
  fill(colorPicker.color());
  stroke(strokeColor);
  circle(x * unitLength, y * unitLength, unitLength, unitLength);
}

const patterns = {
  1: [
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [1, 0, 0, 1],
  ],
  2: [
    [1, 1, 1],
    [1, 1, 0],
    [1, 0, 0],
  ],
};
