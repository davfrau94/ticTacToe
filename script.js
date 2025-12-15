const Gameboard = (() => {
    let board = ["", "", "", "", "", "", "", "", ""];
    const getBoard = () => board;
    const setMark = (index, marker) => {
        if (index >= 0 && index < 9 && board[index] === "") {
            board[index] = marker;
            return true;
        }
        return false;
    };
    const reset = () => {
        board = ["", "", "", "", "", "", "", "", ""];
    };
    const isFull = () => board.every((cell) => cell !== "");
    return { getBoard, setMark, reset, isFull };
})();

const Player = (name, marker) => {
    return { name, marker };
};

const GameController = (() => {
    let players = [];
    let currentPlayerIndex = 0;
    let gameOver = false;

    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // righe
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonne
        [0, 4, 8], [2, 4, 6], // diagonali
    ];
    const init = (player1Name, player2Name) => {
        players = [Player(player1Name, "X"), Player(player2Name, "O")];
        currentPlayerIndex = 0;
        gameOver = false;
        Gameboard.reset();
    };
    const getCurrentPlayer = () => players[currentPlayerIndex];
    const switchPlayer = () => {
        currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
    };

    const checkWinner = () => {
        const board = Gameboard.getBoard();
        for (let combo of winningCombos) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    };

    const playRound = (index) => {
        if (gameOver) return null;
        const currentPlayer = getCurrentPlayer();
        if (Gameboard.setMark(index, currentPlayer.marker)) {
            const winner = checkWinner();
            if (winner) {
                gameOver = true;
                return { type: "win", player: currentPlayer };
            }
            if (Gameboard.isFull()) {
                gameOver = true;
                return { type: "tie" };
            }
            switchPlayer();
            return { type: "continue" };
        }
        return null;
    };

    const isGameOver = () => gameOver;

    return { init, getCurrentPlayer, playRound, isGameOver };
})();

const DisplayController = (() => {
    const setupScreen = document.querySelector(".setup-screen");
    const gameScreen = document.querySelector(".game-screen");
    const boardElement = document.getElementById("board");
    const resultElement = document.getElementById("result");
    const startBtn = document.getElementById("start-btn");
    const restartBtn = document.getElementById("restart-btn");
    const player1Input = document.getElementById("player1");
    const player2Input = document.getElementById("player2");
    const player1NameDisplay = document.getElementById("player1-name");
    const player2NameDisplay = document.getElementById("player2-name");
    const player1Info = document.getElementById("player1-info");
    const player2Info = document.getElementById("player2-info");
    const renderBoard = () => {
        boardElement.innerHTML = "";
        const board = Gameboard.getBoard();
        board.forEach((mark, index) => {
            const cell = document.createElement("button");
            cell.classList.add("cell");
            cell.textContent = mark;
            if (mark) {
                cell.classList.add("taken");
                cell.classList.add(mark.toLowerCase());
            }
            cell.addEventListener("click", () => handleCellClick(index));
            boardElement.appendChild(cell);
        });
    };
    const handleCellClick = (index) => {
        if (GameController.isGameOver()) return;
        const result = GameController.playRound(index);
        if (result) {
            renderBoard();
            updateActivePlayer();
            if (result.type === "win") {
                showResult(`${result.player.name} ha vinto! 🎉`);
            } else if (result.type === "tie") {
                showResult("Pareggio! 🤝");
            }
        }
    };
    const showResult = (message) => {
        resultElement.textContent = message;
    };
    const updateActivePlayer = () => {
        if (GameController.isGameOver()) {
            player1Info.classList.remove("active");
            player2Info.classList.remove("active");
            return;
        }
        const currentPlayer = GameController.getCurrentPlayer();
        if (currentPlayer.marker === "X") {
            player1Info.classList.add("active");
            player2Info.classList.remove("active");
        } else {
            player1Info.classList.remove("active");
            player2Info.classList.add("active");
        }
    };
    const startGame = () => {
        const p1Name = player1Input.value.trim() || "Giocatore 1";
        const p2Name = player2Input.value.trim() || "Giocatore 2";
        GameController.init(p1Name, p2Name);
        player1NameDisplay.textContent = p1Name;
        player2NameDisplay.textContent = p2Name;
        setupScreen.classList.remove("active");
        gameScreen.classList.add("active");
        resultElement.textContent = "";
        renderBoard();
        updateActivePlayer();
    };
    const restartGame = () => {
        setupScreen.classList.add("active");
        gameScreen.classList.remove("active");
    };
    const init = () => {
        startBtn.addEventListener("click", startGame);
        restartBtn.addEventListener("click", restartGame);
        player1Input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") startGame();
        });
        player2Input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") startGame();
        });
    };
    return { init };
})();
DisplayController.init();