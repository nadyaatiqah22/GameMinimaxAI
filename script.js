// Inisialisasi variabel global
const heapsContainer = document.getElementById('heaps-container');
const removeBtn = document.getElementById('remove-stones-button');
const resetBtn = document.getElementById('reset-button');
const statusEl = document.getElementById('status');

// Konfigurasi awal jumlah batu di setiap heap
const initialHeaps = [1, 3, 5, 7];

let heaps = [];
let selectedHeapIndex = null;
let selectedStonesCount = 0;
let gameOver = false;
let playerTurn = true;

// Fungsi inisialisasi ulang game
function init() {
  heaps = initialHeaps.slice();
  selectedHeapIndex = null;
  selectedStonesCount = 0;
  gameOver = false;
  playerTurn = true;
  statusEl.textContent = "Your turn";
  renderHeaps();
  updateRemoveButton();
}

// Menampilkan batu dan heap ke halaman
function renderHeaps() {
  heapsContainer.innerHTML = '';
  heaps.forEach((count, i) => {
    const heapDiv = document.createElement('div');
    heapDiv.className = 'heap';

    const label = document.createElement('div');
    label.className = 'heap-label';
    label.textContent = `Heap ${i + 1} (${count} stones)`;
    heapDiv.appendChild(label);

    const stonesDiv = document.createElement('div');
    stonesDiv.className = 'stones';

    for (let s = 0; s < count; s++) {
      const stone = document.createElement('div');
      stone.className = 'stone';

      // Beri efek visual jika batu dipilih
      if (i === selectedHeapIndex && s < selectedStonesCount) {
        stone.classList.add('selected');
      }

      stone.addEventListener('click', () => {
        if (!playerTurn || gameOver) return;

        if (selectedHeapIndex !== i) {
          selectedHeapIndex = i;
          selectedStonesCount = 1;
        } else {
          selectedStonesCount = s + 1;
        }

        updateRemoveButton();
        renderHeaps();
      });

      stonesDiv.appendChild(stone);
    }

    heapDiv.appendChild(stonesDiv);
    heapsContainer.appendChild(heapDiv);
  });
}

// Cek tombol "Remove" bisa dipakai atau tidak
function updateRemoveButton() {
  removeBtn.disabled = !playerTurn || gameOver || selectedStonesCount === 0 || selectedHeapIndex === null;
}

// Cek apakah semua batu habis (game selesai)
function checkGameOver(state) {
  return state.every(count => count === 0);
}

/**
 * Fungsi rekursif algoritma Minimax.
 * - Mencoba semua kemungkinan langkah.
 * - Memilih langkah terbaik untuk AI (maximizer).
 * - Mengembalikan langkah terbaik dan skornya.
 */
function minimax(state, isMaximizingPlayer, depth = 0) {
  if (checkGameOver(state)) {
    // Skor berdasarkan siapa yang melakukan langkah terakhir (yang menyebabkan game over)
    return { score: isMaximizingPlayer ? -10 + depth : 10 - depth, move: null };
  }

  const moves = [];

  for (let i = 0; i < state.length; i++) {
    if (state[i] === 0) continue;

    for (let removeCount = 1; removeCount <= state[i]; removeCount++) {
      const nextState = state.slice();
      nextState[i] -= removeCount;

      const result = minimax(nextState, !isMaximizingPlayer, depth + 1);

      moves.push({
        heapIndex: i,
        stonesToRemove: removeCount,
        score: result.score
      });
    }
  }

  if (isMaximizingPlayer) {
    let bestMove = moves.reduce((a, b) => (a.score > b.score ? a : b));
    return { score: bestMove.score, move: { ...bestMove } };
  } else {
    let bestMove = moves.reduce((a, b) => (a.score < b.score ? a : b));
    return { score: bestMove.score, move: { ...bestMove } };
  }
}


// Jalankan giliran AI
function aiMove() {
  if (gameOver) return;

  statusEl.textContent = "AI is thinking...";

  setTimeout(() => {
    const { move } = minimax(heaps, true, 0);

    if (move) {
      heaps[move.heapIndex] -= move.stonesToRemove;
      statusEl.textContent = `AI removed ${move.stonesToRemove} stone${move.stonesToRemove > 1 ? 's' : ''} from heap ${move.heapIndex + 1}. Your turn.`;
    } else {
      statusEl.textContent = "AI cannot move.";
    }

    checkWinConditionAfterMove();
    playerTurn = true;
    selectedHeapIndex = null;
    selectedStonesCount = 0;
    renderHeaps();
    updateRemoveButton();
  }, 300);
}

// Cek pemenang dan update status
function checkWinConditionAfterMove() {
  if (checkGameOver(heaps)) {
    gameOver = true;
    const loser = playerTurn ? "You lost! AI wins." : "You win! Congratulations!";
statusEl.textContent = loser;
    statusEl.textContent = winner;
    removeBtn.disabled = true;
  }
}


// Tombol "Remove Selected" diklik
removeBtn.addEventListener('click', () => {
  if (!playerTurn || gameOver) return;
  if (selectedHeapIndex === null || selectedStonesCount === 0) return;

  heaps[selectedHeapIndex] -= selectedStonesCount;
  selectedHeapIndex = null;  
  selectedStonesCount = 0;
  renderHeaps();
  updateRemoveButton();
  checkWinConditionAfterMove();

  if (!gameOver) {
    playerTurn = false;
    statusEl.textContent = "AI's turn...";
    setTimeout(aiMove, 600);
  }
});

// Tombol reset
resetBtn.addEventListener('click', init);

// Jalankan game saat halaman dimuat
init();
