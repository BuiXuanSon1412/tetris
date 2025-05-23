class Block {
  constructor(imageX, imageY, template) {
    this.imageX = imageX;
    this.imageY = imageY;
    this.template = template;
    this.x = squareCountX / 2;
    this.y = 0;
  }
  checkBottom() {
    for (let i = 0; i < this.template.length; i++) {
      for (let j = 0; j < this.template.length; j++) {
        if (this.template[i][j] == 0) continue;
        let realX = j + this.getTruncedPosition().x;
        let realY = i + this.getTruncedPosition().y;
        if (realY + 1 >= squareCountY) return false;
        if (gameMap[realY + 1][realX].imageX != -1) return false;
      }
    }
    return true;
  }

  getTruncedPosition() {
    return { x: Math.trunc(this.x), y: Math.trunc(this.y) };
  }
  checkLeft() {
    for (let i = 0; i < this.template.length; i++) {
      for (let j = 0; j < this.template.length; j++) {
        if (this.template[i][j] == 0) continue;
        let realX = j + this.getTruncedPosition().x;
        let realY = i + this.getTruncedPosition().y;
        if (realX - 1 < 0) return false;
        if (gameMap[realY][realX - 1].imageX != -1) return false;
      }
    }
    return true;
  }
  checkRight() {
    for (let i = 0; i < this.template.length; i++) {
      for (let j = 0; j < this.template.length; j++) {
        if (this.template[i][j] == 0) continue;
        let realX = j + this.getTruncedPosition().x;
        let realY = i + this.getTruncedPosition().y;
        if (realX + 1 >= squareCountX) return false;
        if (gameMap[realY][realX + 1].imageX != -1) return false;
      }
    }
    return true;
  }
  moveRight() {
    if (this.checkRight()) this.x += 1;
  }
  moveLeft() {
    if (this.checkLeft()) this.x -= 1;
  }
  moveBottom() {
    if (this.checkBottom()) {
      this.y += 1;
      score += 1;
    }
  }
  changeRotation() {
    let tmpTemplate = [];
    for (let i = 0; i < this.template.length; i++) {
      tmpTemplate[i] = this.template[i].slice();
    }
    let n = this.template.length;
    for (let layer = 0; layer < n / 2; layer++) {
      let first = layer;
      let last = n - 1 - layer;
      for (let i = first; i < last; i++) {
        let offset = i - first;
        let top = this.template[first][i];
        this.template[first][i] = this.template[i][last];
        this.template[i][last] = this.template[last][last - offset];
        this.template[last][last - offset] = this.template[last - offset][first];
        this.template[last - offset][first] = top;
      }
    }
    for (let i = 0; i < this.template.length; i++) {
      for (let j = 0; j < this.template.length; j++) {
        if (this.template[i][j] == 0) continue;
        let realX = j + this.getTruncedPosition().x;
        let realY = i + this.getTruncedPosition().y;
        if (realX < 0 ||
          realX >= squareCountX ||
          realY < 0 ||
          realY >= squareCountY ||
          gameMap[realY][realX].imageX != -1
        ) {
          this.template = tmpTemplate;
          return false;
        }
      }
    }
  }

}

const imageSquareSize = 24;
const size = 20;
const framePerSecond = 24;
const gameSpeed = 3;
const canvas = document.getElementById("canvas");
const nextShapeCanvas = document.getElementById("nextShapeCanvas");
const scoreCanvas = document.getElementById("scoreCanvas");
const image = document.getElementById("image");
const ctx = canvas.getContext("2d");
const nctx = nextShapeCanvas.getContext("2d");
const sctx = scoreCanvas.getContext("2d");
const squareCountX = canvas.width / size;
const squareCountY = canvas.height / size;
const whiteLineThickness = 2;

const shapes = [
  new Block(0, 120, [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ]),
  new Block(0, 96, [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ]),
  new Block(0, 72, [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ]),
  new Block(0, 48, [
    [0, 0, 0],
    [0, 1, 1],
    [1, 1, 0],
  ]),
  new Block(0, 24, [
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]),
  new Block(0, 0, [
    [1, 1],
    [1, 1],
  ]),
  new Block(0, 48, [
    [0, 0, 0],
    [1, 1, 0],
    [0, 1, 1],
  ])
];

let gameMap;
let gameOver;
let currentShape;
let nextShape;
let score;
let initialTwoDArr;


let gameLoop = () => {
  setInterval(update, 1000 / gameSpeed);
  setInterval(draw, 1000 / framePerSecond);
};

let deleteCompleteRows = () => {
  for (let i = 0; i < gameMap.length; i++) {
    let t = gameMap[i];
    let isComplete = true;
    for (let j = 0; j < t.length; j++) {
      if (t[j].imageX == -1) {
        isComplete = false;
        break;
      }
    }
    if (isComplete) {
      for (let k = i; k > 0; k--) {
        gameMap[k] = gameMap[k - 1];
      }
      let tmp = [];
      for (let k = 0; k < squareCountX; k++) {
        tmp.push({ imageX: -1, imageY: -1 });
      }
      gameMap[0] = tmp;
    }
  }
}

let update = () => {
  if (gameOver) return;
  if (currentShape.checkBottom()) {
    currentShape.y += 1;
  }
  else {
    for (let i = 0; i < currentShape.template.length; i++) {
      for (let j = 0; j < currentShape.template.length; j++) {
        if (currentShape.template[i][j] == 0) continue;
        gameMap[currentShape.getTruncedPosition().y + i]
        [currentShape.getTruncedPosition().x + j]
          = { imageX: currentShape.imageX, imageY: currentShape.imageY };
      }
    }
    deleteCompleteRows();
    currentShape = nextShape;
    nextShape = getRandomShape();
    if (!currentShape.checkBottom()) gameOver = true;
    score += 100;
  }


};

let drawRect = (x, y, width, height, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
};

let drawBackground = () => {
  drawRect(0, 0, canvas.width, canvas.height, "#bca0dc")
  for (let i = 0; i < squareCountX + 1; i++) {
    drawRect(
      size * i - whiteLineThickness,
      0,
      whiteLineThickness,
      canvas.height,
      "white",
    )
  }
  for (let i = 0; i < squareCountY + 1; i++) {
    drawRect(
      0,
      size * i - whiteLineThickness,
      canvas.width,
      whiteLineThickness,
      "white",
    )
  }
};

let drawCurrentBlock = () => {
  for (let i = 0; i < currentShape.template.length; i++) {
    for (let j = 0; j < currentShape.template.length; j++) {
      if (currentShape.template[i][j] == 0) continue;
      ctx.drawImage(
        image,
        currentShape.imageX,
        currentShape.imageY,
        imageSquareSize,
        imageSquareSize,
        Math.trunc(currentShape.x) * size + j * size,
        Math.trunc(currentShape.y) * size + i * size,
        size,
        size,
      )
    }
  }
};

let drawSquares = () => {

  for (let i = 0; i < gameMap.length; i++) {
    let t = gameMap[i];
    for (let j = 0; j < t.length; j++) {
      if (t[j].imageX == -1) continue;
      ctx.drawImage(
        image,
        t[j].imageX,
        t[j].imageY,
        imageSquareSize,
        imageSquareSize,
        j * size,
        i * size,
        size,
        size,
      )
    }
  }
};

let drawNextShape = () => {
  nctx.fillStyle = "#bca0dc";
  nctx.fillRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);
  for (let i = 0; i < nextShape.template.length; i++) {
    for (let j = 0; j < nextShape.template.length; j++) {
      if (nextShape.template[i][j] == 0) continue;
      nctx.drawImage(
        image,
        nextShape.imageX,
        nextShape.imageY,
        imageSquareSize,
        imageSquareSize,
        (j + 1) * size,
        (i + 1) * size,
        size,
        size,
      )
    }
  }
};

let drawScore = () => {
  sctx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
  sctx.font = "bold 20px 'VT323'";
  sctx.fillStyle = "black";
  sctx.fillText(score, scoreCanvas.width / 2 - sctx.measureText(score.toString()).width / 2, scoreCanvas.height / 2);
}

let drawGameOver = () => {
  ctx.font = "bold 30px 'VT323'";
  ctx.fillStyle = "red";
  let message = "Game Over!";
  ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2);
}

let draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawSquares();
  drawCurrentBlock();
  drawNextShape();
  drawScore();
  if (gameOver) {
    drawGameOver();
  }

}

let getRandomShape = () => {
  return Object.create(shapes[Math.floor(Math.random() * shapes.length)]);
}

let resetVars = () => {
  initialTwoDArr = [];
  for (let i = 0; i < squareCountY; i++) {
    let temp = []
    for (let j = 0; j < squareCountX; j++) {
      temp.push({ imageX: -1, imageY: -1 });
    }
    initialTwoDArr.push(temp);
  }
  score = 0;
  gameOver = false;
  currentShape = getRandomShape();
  nextShape = getRandomShape();
  gameMap = initialTwoDArr;
  gameLoop();
}

window.addEventListener("keydown", (event) => {
  let k = event.keyCode;
  if (k == 37) currentShape.moveLeft();
  else if (k == 38) currentShape.changeRotation();
  else if (k == 39) currentShape.moveRight();
  else if (k == 40) currentShape.moveBottom();
})

resetVars();
gameLoop();
