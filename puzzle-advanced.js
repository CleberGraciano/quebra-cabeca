const puzzle = document.getElementById('puzzle');
const imageInput = document.getElementById('imageInput');
const sizeInput = document.getElementById('sizeInput');

let pieces = [];
let size = parseInt(sizeInput.value);
let imageURL = '';
let dragSource = null;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createPuzzle() {
  puzzle.innerHTML = '';
  puzzle.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  puzzle.style.gridTemplateRows = `repeat(${size}, 1fr)`;

  pieces.forEach((value, index) => {
    const div = document.createElement('div');
    div.classList.add('piece');
    div.dataset.index = index;

    const row = Math.floor((value - 1) / size);
    const col = (value - 1) % size;

    div.style.backgroundImage = `url(${imageURL})`;
    div.style.backgroundPosition = `-${(col*100)/size}% -${(row*100)/size}%`;
    div.style.backgroundSize = `${size*100}% ${size*100}%`;

    // Drag & Drop desktop
    div.setAttribute('draggable', true);
    div.addEventListener('dragstart', () => dragSource = index);
    div.addEventListener('dragover', e => e.preventDefault());
    div.addEventListener('drop', () => movePiece(dragSource, index));

    // Touch events
    div.addEventListener('touchstart', () => dragSource = index);
    div.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && target.classList.contains('piece')) {
        const dropIndex = parseInt(target.dataset.index);
        movePiece(dragSource, dropIndex);
      }
      dragSource = null;
    });

    puzzle.appendChild(div);
  });
}

function movePiece(fromIndex, toIndex) {
  if (fromIndex === null || toIndex === null) return;
  [pieces[fromIndex], pieces[toIndex]] = [pieces[toIndex], pieces[fromIndex]];
  createPuzzle();
  checkWin();
}

function checkWin() {
  const correct = Array.from({length: size*size}, (_, i) => i+1);
  if (pieces.every((v, i) => v === correct[i])) {
    setTimeout(() => alert('Parabéns! Você completou o quebra-cabeça!'), 100);
  }
}

function initPuzzle() {
  pieces = Array.from({length: size*size}, (_, i) => i+1);
  shuffle(pieces);
  createPuzzle();
}

imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    imageURL = URL.createObjectURL(file);
    size = parseInt(sizeInput.value);
    initPuzzle();
  }
});

sizeInput.addEventListener('change', () => {
  size = parseInt(sizeInput.value);
  if (imageURL) initPuzzle();
});
