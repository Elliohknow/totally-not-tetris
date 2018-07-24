const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

function zoneSweep() {
  let rowCount = 1;
  outer: for (let y = zone.length - 1; y > 0; --y) {
    for (let x = 0; x < zone[y].length; ++x) {
      if (zone[y][x] === 0) {
        continue outer;
        // * i.e. continue on the next row, handled by outer loop, ending inner loop
      }
    }

    const row = zone.splice(y, 1)[0].fill(0);
    zone.unshift(row);
    ++y;

    block.score += rowCount * 10;
    rowCount *= 2;
  }
}

function collide(zone, block) {
  const m = block.tetromino;
  const o = block.position;  
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (zone[y + o.y] && zone[y + o.y][x + o.x]) !== 0) {
        return true; // there is a collision if zone row/column !== 0
      }
    }
  }
  return false; // if zone row and column === 0, then no collision 
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createTetromino(type) {
  if (type === 'T') {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ];
  } else if (type === 'L') {
    return [
      [0, 2, 0],
      [0, 2, 0],
      [0, 2, 2]
    ];
  } else if (type === 'J') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [3, 3, 0]
    ];
  } else if (type === 'S') {
    return [
      [0, 0, 0],
      [0, 4, 4],
      [4, 4, 0]
    ];
  } else if(type === 'Z') {
    return [
      [0, 0, 0],
      [5, 5, 0],
      [0, 5, 5]
    ];
  } else if (type === 'O') {
    return [
      [6, 6],
      [6, 6]
    ];
  } else if (type === 'I') {
    return [
      [0, 7, 0, 0],
      [0, 7, 0, 0],
      [0, 7, 0, 0],
      [0, 7, 0, 0]
    ];
  } 
}


function draw() {
  context.fillStyle = '#021331';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawTetromino(zone, { x: 0, y: 0});
  drawTetromino(block.tetromino, block.position);
}

function drawTetromino(tetromino, offset) {
  tetromino.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(zone, block) {
  block.tetromino.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        zone[y + block.position.y][x + block.position.x] = value;
      }
    });
  });
}

function moveDown() { // consolidate falling of the block into one function
  block.position.y++;
  if (collide(zone, block)) {
    block.position.y--;
    merge(zone, block);
    resetTetromino();
    zoneSweep();
    updateScore();
  }
  dropCounter = 0;
}

function moveToSide(offset) {
  block.position.x += offset;
  if (collide(zone, block)) {
    block.position.x -= offset;
  } 
}

function resetTetromino() {
  const blocks = 'TLJSZOI';
  block.tetromino = createTetromino(blocks[blocks.length * Math.random() | 0]);
  block.position.y = 0;
  block.position.x = (zone[0].length / 2 | 0) - 
                     (block.tetromino[0].length / 2 | 0); // '| 0' makes it floored(?)
  if (collide(zone, block)) {
    zone.forEach(row => row.fill(0));
    block.score = 0;
    updateScore();
  }
}

function rotateBlock(direction) {
  const position = block.position.x;
  let offset = 1;
  rotate(block.tetromino, direction);
  while(collide(zone, block)) {
    block.position.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > block.tetromino[0].length) {
      rotate(block.tetromino, -direction);
      block.position.x = position;
      return;
    }
  }
}

function rotate(tetromino, direction) {
  for (let y = 0; y < tetromino.length; ++y) {
    for (let x = 0; x < y; ++x) {
      // 'tuple switch'
      [
        tetromino[x][y],
        tetromino[y][x],
      ] = [
        tetromino[y][x],
        tetromino[x][y],
      ];
    }
  }
  if (direction > 0) {
    tetromino.forEach(row => row.reverse());
  } else {
    tetromino.reverse();
  } 
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    moveDown();
  }

  draw(); 

  requestAnimationFrame(update);
}

function updateScore() {
  document.getElementById('score').innerHTML = block.score;
}

const colors = [
  null,
  'purple',
  'orange',
  'blue',
  'green',
  'red',
  'yellow',
  'teal'
];

const zone = createMatrix(12, 20);

const block = {
  position: { x: 0, y: 0 },
  tetromino: null,
  score: 0
}

document.addEventListener('keydown', (event) => {
  // console.log(event); // To check keyCode
  if (event.keyCode === 37) {        // Left
    moveToSide(-1);
  } else if (event.keyCode === 39) { // Right
    moveToSide(1);
  } else if (event.keyCode === 40) { // Down
    moveDown();
  } else if (event.keyCode === 81) { // Q
    rotateBlock(-1);
  } else if (event.keyCode === 87 || event.keyCode === 38) { // W/Up
    rotateBlock(1);
  }
});

resetTetromino();
updateScore();
update();