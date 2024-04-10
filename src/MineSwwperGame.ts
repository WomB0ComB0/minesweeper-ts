class MinesweeperGame {
    grid: HTMLDivElement;
    flagsLeft: HTMLSpanElement;
    result: HTMLDivElement;
    width: number;
    bombAmount: number;
    flags: number;
    squares: HTMLDivElement[];

    constructor(grid: HTMLDivElement, flagsLeft: HTMLSpanElement, result: HTMLDivElement) {
        this.grid = grid;
        this.flagsLeft = flagsLeft;
        this.result = result;
        this.width = 10;
        this.bombAmount = 20;
        this.flags = 0;
        this.squares = [];
        this.createBoard();
    }

    setDifficulty(difficulty: string): void {
        if (difficulty === 'easy') {
            this.width = 10;
            this.bombAmount = 20;
        } else if (difficulty === 'medium') {
            this.width = 14;
            this.bombAmount = 50;
        } else {
            this.width = 20;
            this.bombAmount = 100;
        }
    }

    createBoard(): void {
        this.flagsLeft.innerHTML = this.bombAmount.toString();
        const bombsArray = Array(this.bombAmount).fill('bomb');
        const emptyArray = Array(this.width * this.width - this.bombAmount).fill('valid');
        const gameArray = emptyArray.concat(bombsArray);
        const shuffledArray = gameArray.sort(() => Math.random() - 0.5);
        for (let i = 0; i < this.width * this.width; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i.toString());
            square.classList.add(shuffledArray[i]);
            this.grid.appendChild(square);
            this.squares.push(square);
            square.addEventListener('click', () => {
                this.click(square);
            });
            square.oncontextmenu = (e) => {
                e.preventDefault();
                this.addFlag(square);
            };
        }
        for (let i = 0; i < this.squares.length; i++) {
            let total = 0;
            const isLeftEdge = (i % this.width === 0);
            const isRightEdge = (i % this.width === this.width - 1);
            if (this.squares[i].classList.contains('valid')) {
                if (i > 0 && !isLeftEdge && this.squares[i - 1].classList.contains('bomb')) total++;
                if (i > 9 && !isRightEdge && this.squares[i + 1 - this.width].classList.contains('bomb')) total++;
                if (i > 10 && this.squares[i - this.width].classList.contains('bomb')) total++;
                if (i > 11 && !isLeftEdge && this.squares[i - 1 - this.width].classList.contains('bomb')) total++;
                if (i < 98 && !isRightEdge && this.squares[i + 1].classList.contains('bomb')) total++;
                if (i < 90 && !isLeftEdge && this.squares[i - 1 + this.width].classList.contains('bomb')) total++;
                if (i < 88 && !isRightEdge && this.squares[i + 1 + this.width].classList.contains('bomb')) total++;
                if (i < 89 && this.squares[i + this.width].classList.contains('bomb')) total++;
            }
        }
    }

    addFlag(square: HTMLDivElement): void {
        if (this.isGameOver) return;
        if (!square.classList.contains('checked') && (this.flags < this.bombAmount)) {
            if (!square.classList.contains('flag')) {
                this.flagSound.play();
                square.classList.add('flag');
                square.innerHTML = ' 🚩';
                this.flags++;
                this.flagsLeft.innerHTML = (this.bombAmount - this.flags).toString();
                this.checkForWin();
            } else {
                this.flagSound.play();
                square.classList.remove('flag');
                square.innerHTML = '';
                this.flags--;
                this.flagsLeft.innerHTML = (this.bombAmount - this.flags).toString();
            }
        }
    }

    click(square: HTMLElement): void {
        let currentId = square.id;
        if (this.isGameOver) return;
        if (square.classList.contains('checked') || square.classList.contains('flag')) return;
        if (square.classList.contains('bomb')) {
            this.bombSound.play();
            this.gameOver(square);
        } else {
            let total = square.getAttribute('data');
            if (+total! != 0) {
                square.classList.add('checked');
                this.clickSound.play();
                if (totzal == 1) square.classList.add('one');
                if (total == 2) square.classList.add('two');
                if (total == 3) square.classList.add('three');
                if (total == 4) square.classList.add('four');
                square.innerHTML = total;
                return;
            }
            this.checkSquare(square, currentId);
        }
        square.classList.add('checked');
    }

    checkSquare(square: any, currentId: string | number) {
        const isLeftEdge = (currentId % this.width === 0);
        const isRightEdge = (currentId % this.width === this.width - 1);
        setTimeout(() => {
            if (currentId > 0 && !isLeftEdge) {
                const newId = this.squares[parseInt(currentId) - 1].id;
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId > 9 && !isRightEdge) {
                const newId = this.squares[parseInt(currentId) + 1 - this.width].id;
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId > 10) {
                const newId = this.squares[parseInt(currentId - this.width)].id;
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId > 11 && !isLeftEdge) {
                const newId = this.squares[parseInt(currentId) - 1 - this.width].id;
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId < 98 && !isRightEdge) {
                const newId = this.squares[parseInt(currentId) + 1].id;
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId < 90 && !isLeftEdge) {
                const newId = this.squares[parseInt(currentId) - 1 + this.width].id;
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId < 88 && !isRightEdge) {
                const newId = this.squares[parseInt(currentId) + 1 + this.width].id;
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
            if (currentId < 89) {
                const newId = this.squares[parseInt(currentId) + this.width].id;
                const newSquare = document.getElementById(newId);
                this.click(newSquare);
            }
        }, 10);
    }

    gameOver(square: any) {
        this.result.innerHTML = 'BOOM! Game Over!';
        this.isGameOver = true;
        this.squares.forEach(square => {
            if (square.classList.contains('bomb')) {
                square.innerHTML = '💣';
                square.classList.remove('bomb');
                square.classList.add('checked');
            }
        });
    }

    checkForWin() {
        let matches = 0;
        for (let i = 0; i < this.squares.length; i++) {
            if (this.squares[i].classList.contains('flag') && this.squares[i].classList.contains('bomb')) {
                matches++;
            }
            if (matches === this.bombAmount) {
                this.winSound.play();
                new ConfettiGenerator();
                this.result.innerHTML = 'YOU WIN!';
                this.isGameOver = true;
            }
        }
    }
}