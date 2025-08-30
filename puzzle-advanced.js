const puzzle = document.getElementById('puzzle');
const imageInput = document.getElementById('imageInput');
const sizeInput = document.getElementById('sizeInput');

let pieces = [];
let size = parseInt(sizeInput.value);
let pieceImages = []; // peças cortadas fixas
let emptyIndex = null;
let originalImage = null;

// Shuffle simples
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Cria o grid do puzzle
function createPuzzle() {
  puzzle.innerHTML = '';
  puzzle.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  puzzle.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  pieces.forEach((value, index) => {
    const div = document.createElement('div');
    div.classList.add('piece');
    div.dataset.index = index;

    if (value === null) {
      div.classList.add('empty');
      emptyIndex = index;
    } else {
      div.style.backgroundImage = `url(${pieceImages[value-1]})`;
      div.style.backgroundSize = '100% 100%'; // ajusta visualmente

      // Mouse click / touch
      div.addEventListener('click', () => movePiece(index));
      div.addEventListener('touchend', () => movePiece(index));
    }

    puzzle.appendChild(div);
  });
}

// Movimento válido apenas para vizinhos do vazio
function isNeighbor(index1, index2) {
  const row1 = Math.floor(index1 / size);
  const col1 = index1 % size;
  const row2 = Math.floor(index2 / size);
  const col2 = index2 % size;
  return (row1 === row2 && Math.abs(col1 - col2) === 1) || 
         (col1 === col2 && Math.abs(row1 - row2) === 1);
}

// Move peça
function movePiece(index) {
  if (isNeighbor(index, emptyIndex)) {
    [pieces[index], pieces[emptyIndex]] = [pieces[emptyIndex], pieces[index]];
    createPuzzle();
    checkWin();
  }
}

// Verifica vitória
function checkWin() {
  const correct = Array.from({length: size*size - 1}, (_, i) => i+1).concat([null]);
  if (pieces.every((v,i) => v === correct[i])) {
    setTimeout(() => alert('Parabéns! Quebra-cabeça completo!'), 100);
  }
}

// Cortar a imagem **uma única vez** no tamanho original
function cutImageFixed(img, maxPieces) {
  const minSide = Math.min(img.width, img.height);
  const pieceSize = Math.floor(minSide / maxPieces);
  const imgs = [];

  const canvas = document.createElement('canvas');
  canvas.width = pieceSize;
  canvas.height = pieceSize;
  const ctx = canvas.getContext('2d');

  for (let row = 0; row < maxPieces; row++) {
    for (let col = 0; col < maxPieces; col++) {
      ctx.clearRect(0, 0, pieceSize, pieceSize);
      ctx.drawImage(
        img,
        col * pieceSize,
        row * pieceSize,
        pieceSize,
        pieceSize,
        0,
        0,
        pieceSize,
        pieceSize
      );
      imgs.push(canvas.toDataURL());
    }
  }
  return imgs;
}

// Inicializar puzzle
function initPuzzle(image) {
  originalImage = image;
  const maxPieces = Math.max(3, 5); // define corte fixo máximo
  pieceImages = cutImageFixed(image, maxPieces);

  pieces = Array.from({length: size*size}, (_, i) => i+1);
  pieces[pieces.length-1] = null; // último vazio
  shuffleDeslizante();
  createPuzzle();
}

// Embaralhamento válido
function shuffleDeslizante() {
  emptyIndex = pieces.indexOf(null);
  const moves = size*size*10;
  let lastMove = null;

  for (let i = 0; i < moves; i++) {
    const neighbors = [];
    for (let j = 0; j < pieces.length; j++) {
      if (isNeighbor(j, emptyIndex) && j !== lastMove) neighbors.push(j);
    }
    const move = neighbors[Math.floor(Math.random()*neighbors.length)];
    [pieces[move], pieces[emptyIndex]] = [pieces[emptyIndex], pieces[move]];
    lastMove = emptyIndex;
    emptyIndex = move;
  }
}

// Eventos de input
imageInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    const img = new Image();
    img.onload = () => {
      size = parseInt(sizeInput.value);
      initPuzzle(img);
    }
    img.src = URL.createObjectURL(file);
  }
});

sizeInput.addEventListener('change', () => {
  size = parseInt(sizeInput.value);
  if (originalImage) initPuzzle(originalImage); // usa a mesma imagem
});
