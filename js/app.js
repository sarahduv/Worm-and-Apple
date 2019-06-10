'use strict';

const grid = document.getElementById('grid');
const rowsNum = 40;
const colsNum = 50;

// Types of cells
const TYPE_EMPTY = 0;
const TYPE_WALL = 1;
const TYPE_APPLE = 2;
const TYPE_SNAKE = 3;

// Directions
const DIR_UP = 0;
const DIR_DOWN = 1;
const DIR_RIGHT = 2;
const DIR_LEFT = 3;

// Whether the game is running or not right now
var gameOn = true;

// Apple counter
var appleCount = 0;
var appleCounterBox = document.getElementById('appleCounterBox');

function init(){
  // For every row
  for (var row=0; row<rowsNum; row++){
    
    // Create row element
    var trEl = document.createElement('tr');
    grid.appendChild(trEl);

    // For every column
    for (var col=0; col<colsNum; col++){
      // Create the cell elements
      var tdEl = document.createElement('td');
      tdEl.classList.add('gridCell');
      tdEl.setAttribute('id', getCellId(row, col));
      trEl.appendChild(tdEl);

      // Create a cellData for every cell element
      tdEl.cellData = new CellData(row, col, tdEl);

      // Draw the border of walls around the grid
      if (row === 0) {
        makeWall(tdEl.cellData);
      }
      if (row === rowsNum - 1){
        makeWall(tdEl.cellData);
      }
      if (col === 0){
        makeWall(tdEl.cellData);
      }
      if (col === colsNum - 1){
        makeWall(tdEl.cellData);
      }
    }
  }
}

function CellData(row, col, el){

  // Cell data keeps track of row/col/type and the element
  this.row = row;
  this.col = col;
  this.type = TYPE_EMPTY;
  this.el = el;

  // Returns the adjacent cell to this instance for the given direction
  this.getNeighbor = function(direction){
    var neighborEl = null;
    if (direction == DIR_UP) {
      neighborEl = getCellEl(this.row - 1, this.col);
    } else if (direction == DIR_DOWN){
      neighborEl = getCellEl(this.row + 1, this.col);
    } else if (direction == DIR_LEFT){
      neighborEl = getCellEl(this.row, this.col - 1);
    } else if (direction == DIR_RIGHT){
      neighborEl = getCellEl(this.row, this.col + 1);
    }

    // If the neighbor exist, then return the cellData of it
    if (neighborEl !== null) {
      return neighborEl.cellData;
    } else {
      return null;
    }
  }
}

// A cell ID for a given row and column
function getCellId(row, col){
  return 'cell_row' + row + '_col' + col;
}

// Changing the cell data to be a wall
function makeWall(cellData){
  cellData.type = TYPE_WALL;
  cellData.el.classList.add('gridWall');
}

// Getting the cell element at row and col
function getCellEl(row, col){
  return document.getElementById(getCellId(row, col));
}

// Snake constructor
function Snake(cellData){
  this.dir = DIR_LEFT;
  this.head = cellData;
  this.tail = [];
  this.tail.push(cellData.getNeighbor(DIR_RIGHT));
  this.tail.push(cellData.getNeighbor(DIR_RIGHT).getNeighbor(DIR_RIGHT));

  // Constructing the snake
  makeSnake(this.head);
  for (var i = 0; i < this.tail.length; i++){
    makeSnake(this.tail[i]);
  }

  // This moves the snake once in its direction
  this.move = function(){
    var newHead = this.head.getNeighbor(this.dir);
    if (newHead === null){
      console.log('player wins');
      gameOn = false;
      return;
    } else if (newHead.type === TYPE_WALL || newHead.type === TYPE_SNAKE){
      console.log('player loses');
      gameOn = false;
      return;
    } else if (newHead.type === TYPE_APPLE){
      newHead.el.classList.remove('apple');
      appleCount += 1;
      renderAppleCount();
    } else {
      var last = this.tail.pop(); // Removes the tail
      makeEmpty(last);
    }

    // Moves the snake by replacing the head
    this.tail.unshift(this.head);
    this.head = newHead;
    makeSnake(this.head);
  };

  // Changes the direction if the direction is valid - we don't want to backtrack the snake
  this.setDir = function(newDir){
    if (this.dir === DIR_UP && newDir === DIR_DOWN){
      return;
    }
    if (this.dir === DIR_DOWN && newDir === DIR_UP){
      return;
    }
    if (this.dir === DIR_LEFT && newDir === DIR_RIGHT){
      return;
    }
    if (this.dir === DIR_RIGHT && newDir === DIR_LEFT){
      return;
    }
    this.dir = newDir;
  };
}

// Changes the type and class of the snake
function makeSnake(cellData){
  cellData.type = TYPE_SNAKE;
  cellData.el.classList.add('snakeBody');
}

// Changes the type and class if the cell element is now empty - contains no snake or apple
function makeEmpty(cellData){
  cellData.type = TYPE_EMPTY;
  cellData.el.classList.remove('snakeBody');
  cellData.el.classList.remove('apple');
}

// Changes the type and class if the cell element contains an apple
function makeApple(cellData){
  cellData.type = TYPE_APPLE;
  cellData.el.classList.add('apple');
}

// Places an apple at a random location
function placeRandomApple(){
  var rowForApple = -1;
  var colForApple = -1;

  while (!isAppleLocationValid(rowForApple, colForApple)){
    rowForApple = getRandomIntInclusive(0, rowsNum - 1);
    colForApple = getRandomIntInclusive(0, colsNum - 1);
  }

  var appleCellEl = getCellEl(rowForApple, colForApple);
  makeApple(appleCellEl.cellData);
}

// Checks to see if the apple location is valid - we don't want to place an apple on a snake or a wall element
function isAppleLocationValid(row, col){
  var el = getCellEl(row, col);
  if (el === null){
    return false;
  }
  var cellData = el.cellData;
  if (cellData.type === TYPE_EMPTY){
    return true;
  } else {
    return false;
  }
}

// Gets a random location for the apple placement
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

function renderAppleCount(){
  appleCounterBox.innerHTML = 'Total Apples: ' + appleCount;
}

// Listens for keys in relation to direction
window.onkeydown = function(e) {
  if (e.key === 'ArrowUp') {
    snake1.setDir(DIR_UP);
  } else if (e.key === 'ArrowDown') {
    snake1.setDir(DIR_DOWN);
  } else if (e.key === 'ArrowLeft') {
    snake1.setDir(DIR_LEFT);
  } else if (e.key === 'ArrowRight') {
    snake1.setDir(DIR_RIGHT);
  }
};

init();

var centerCellEl = getCellEl(rowsNum / 2, colsNum / 2);
var snake1 = new Snake(centerCellEl.cellData);

// Game engine that moves the snake every 100 ms
setInterval(() => {
  if (gameOn){
    snake1.move();
  }
}, 100);

// Places a random apple between a specified random time
function queueNextApple() {
  if (!gameOn){
    return;
  }
  setTimeout(() => {
    placeRandomApple();
    queueNextApple();   
  }, getRandomIntInclusive(2000, 6000));
}

queueNextApple();
renderAppleCount();
