const grid = document.querySelector('.grid')
const flagsLeft = document.querySelector('#flags-left')! as HTMLSpanElement
const result = document.querySelector('#result')! as HTMLDivElement
let width: number = 10
let bombAmount: number = 20
let flags: number = 0
let squares: HTMLDivElement[] | { classList: { contains: (arg0: string) => any } }[] = []
let isGameOver: boolean = false
const clickSound = new Audio('./Music/click.mp3');
const bombSound = new Audio('./Music/bomb.mp3');
const winSound = new Audio('./Music/win.mp3');
const flagSound = new Audio('./Music/flag.mp3');

// TODO: Add difficulty settings
function setDifficulty(difficulty: string): void { //set difficulty
  if (difficulty === 'easy') {
    width = 10
    bombAmount = 20
  } else if (difficulty === 'medium') {
    width = 14
    bombAmount = 50
  } else {
    width = 20
    bombAmount = 100
  }
}

function createBoard() { //create Board
  flagsLeft.innerHTML = bombAmount.toString()
  const bombsArray: string[] = Array(bombAmount).fill('bomb') //create array with bombs
  const emptyArray: string[] = Array(width * width - bombAmount).fill('valid')
  const gameArray: string[] = emptyArray.concat(bombsArray)
  const shuffledArray = gameArray.sort(() => Math.random() - 0.5)
  for (let i = 0; i < width * width; i++) {
    const square = document.createElement('div')
    square.setAttribute('id', i)
    square.classList.add(shuffledArray[i])
    grid.appendChild(square)
    squares.push(square)
    square.addEventListener('click', function (e) { //normal click
      click(square)
    })
    square.oncontextmenu = function (e) { //ctrl and left click
      e.preventDefault()
      addFlag(square)
    }
  }
  for (let i = 0; i < squares.length; i++) { //add numbers
    let total = 0
    const isLeftEdge = (i % width === 0)
    const isRightEdge = (i % width === width - 1)
    if (squares[i].classList.contains('valid')) {
      if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('bomb')) total++
      if (i > 9 && !isRightEdge && squares[i + 1 - width].classList.contains('bomb')) total++
      if (i > 10 && squares[i - width].classList.contains('bomb')) total++
      if (i > 11 && !isLeftEdge && squares[i - 1 - width].classList.contains('bomb')) total++
      if (i < 98 && !isRightEdge && squares[i + 1].classList.contains('bomb')) total++
      if (i < 90 && !isLeftEdge && squares[i - 1 + width].classList.contains('bomb')) total++
      if (i < 88 && !isRightEdge && squares[i + 1 + width].classList.contains('bomb')) total++
      if (i < 89 && squares[i + width].classList.contains('bomb')) total++
      // Snapshot
      // squares[i].setAttribute('data', total)

    }
  }
}
createBoard()
function addFlag(square: HTMLDivElement) { //add Flag with right click
  if (isGameOver) return
  if (!square.classList.contains('checked') && (flags < bombAmount)) {
    if (!square.classList.contains('flag')) {
      flagSound.play();
      square.classList.add('flag')
      square.innerHTML = ' 🚩'
      flags++
      flagsLeft.innerHTML = bombAmount - flags
      checkForWin()
    } else {
      flagSound.play();
      square.classList.remove('flag')
      square.innerHTML = ''
      flags--
      flagsLeft.innerHTML = bombAmount - flags
    }
  }
}
function click(square: HTMLElement | null) { //click on square actions
  let currentId = square.id
  if (isGameOver) return
  if (square.classList.contains('checked') || square.classList.contains('flag')) return
  if (square.classList.contains('bomb')) {
    bombSound.play();
    gameOver(square)
  } else {
    let total = square.getAttribute('data')
    if (total != 0) {
      square.classList.add('checked')
      clickSound.play();
      if (total == 1) square.classList.add('one')
      if (total == 2) square.classList.add('two')
      if (total == 3) square.classList.add('three')
      if (total == 4) square.classList.add('four')
      square.innerHTML = total
      return
    }
    checkSquare(square, currentId)
  }
  square.classList.add('checked')
}
//check neighboring squares once square is clicked
function checkSquare(square: any, currentId: string | number) {
  const isLeftEdge = (currentId % width === 0)
  const isRightEdge = (currentId % width === width - 1)
  setTimeout(() => {
    if (currentId > 0 && !isLeftEdge) {
      const newId = squares[parseInt(currentId) - 1].id
      const newSquare = document.getElementById(newId)
      click(newSquare)
    }
    if (currentId > 9 && !isRightEdge) {
      const newId = squares[parseInt(currentId) + 1 - width].id
      const newSquare = document.getElementById(newId)
      click(newSquare)
    }
    if (currentId > 10) {
      const newId = squares[parseInt(currentId - width)].id
      const newSquare = document.getElementById(newId)
      click(newSquare)
    }
    if (currentId > 11 && !isLeftEdge) {
      const newId = squares[parseInt(currentId) - 1 - width].id
      const newSquare = document.getElementById(newId)
      click(newSquare)
    }
    if (currentId < 98 && !isRightEdge) {
      const newId = squares[parseInt(currentId) + 1].id
      const newSquare = document.getElementById(newId)
      click(newSquare)
    }
    if (currentId < 90 && !isLeftEdge) {
      const newId = squares[parseInt(currentId) - 1 + width].id
      const newSquare = document.getElementById(newId)
      click(newSquare)
    }
    if (currentId < 88 && !isRightEdge) {
      const newId = squares[parseInt(currentId) + 1 + width].id
      const newSquare = document.getElementById(newId)
      click(newSquare)
    }
    if (currentId < 89) {
      const newId = squares[parseInt(currentId) + width].id
      const newSquare = document.getElementById(newId)
      click(newSquare)
    }
  }, 10)
}
function gameOver(square: any) { // Game Over
  result.innerHTML = 'BOOM! Game Over!'
  isGameOver = true
  squares.forEach(square => { //show ALL the bombs
    if (square.classList.contains('bomb')) {
      square.innerHTML = '💣'
      square.classList.remove('bomb')
      square.classList.add('checked')
    }
  })
}
function checkForWin() { //check for win
  let matches = 0
  for (let i = 0; i < squares.length; i++) {
    if (squares[i].classList.contains('flag') && squares[i].classList.contains('bomb')) {
      matches++
    }
    if (matches === bombAmount) {
      winSound.play();
      // 🚩
      new ConfettiGenerator();
      result.innerHTML = 'YOU WIN!'
      isGameOver = true
    }
  }
}

class ConfettoBase {
    protected random = Math.random;
    protected cos = Math.cos;
    protected sin = Math.sin;
    protected PI = Math.PI;
    protected PI2 = this.PI * 2;
    protected deviation = 100;

    constructor(protected outer: HTMLDivElement, protected inner: HTMLDivElement) {}

    protected color(r: number, g: number, b: number): string {
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    protected interpolation(a: number, b: number, t: number): number {
        return (1 - this.cos(this.PI * t)) / 2 * (b - a) + a;
    }

    protected createPoisson(): number[] {
        const radius = 1 / 10, radius2 = radius + radius;
        const random = this.random;
        let measure = 1 - radius2;
        const spline = [0, 1];
        while (measure) {
            let dart = measure * random();
            let i, l, interval, a, b, c, d;
            const domain = [radius, 1 - radius];
            for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
                a = domain[i], b = domain[i + 1], interval = b - a;
                if (dart < measure + interval) {
                    spline.push(dart += a - measure);
                    break;
                }
                measure += interval;
            }
            c = dart - radius;
            d = dart + radius;
            for (i = domain.length - 1; i > 0; i -= 2) {
                l = i - 1, a = domain[l], b = domain[i];
                if (a >= c && a < d)
                    if (b > d) domain[l] = d;
                    else domain.splice(l, 2);
                else if (a < c && b > c)
                    if (b <= d) domain[i] = c;
                    else domain.splice(i, 0, c, d);
            }
            for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
                measure += domain[i + 1] - domain[i];
        }
        return spline.sort();
    }
}

class Confetto extends ConfettoBase {
    private axis: string;
    private theta: number;
    private dTheta: number;
    private x: number;
    private y: number;
    private dx: number;
    private dy: number;
    private splineX: number[];
    private splineY: number[];
    private frame = 0;

    constructor(outer: HTMLDivElement, inner: HTMLDivElement, theme: () => string) {
        super(outer, inner);

        const outerStyle = this.outer.style, innerStyle = this.inner.style;
        outerStyle.position = 'absolute';
        outerStyle.width = (3 + 9 * this.random()) + 'px';
        outerStyle.height = (3 + 9 * this.random()) + 'px';
        innerStyle.width = '100%';
        innerStyle.height = '100%';
        innerStyle.backgroundColor = theme();

        outerStyle.perspective = '50px';
        outerStyle.transform = 'rotate(' + (360 * this.random()) + 'deg)';
        this.axis = 'rotate3D(' +
            this.cos(360 * this.random()) + ',' +
            this.cos(360 * this.random()) + ',0,';
        this.theta = 360 * this.random();
        this.dTheta = 0.4 + 0.3 * this.random();
        innerStyle.transform = this.axis + this.theta + 'deg)';

        this.x = window.innerWidth * this.random();
        this.y = -this.deviation;
        this.dx = this.sin(-0.1 + -0.1 * this.random());
        this.dy = 0.13 + 0.05 * this.random();
        outerStyle.left = this.x + 'px';
        outerStyle.top = this.y + 'px';

        this.splineX = this.createPoisson();
        this.splineY = [];
        for (let i = 1, l = this.splineX.length - 1; i < l; ++i)
            this.splineY[i] = this.deviation * this.random();
        this.splineY[0] = this.splineY[l] = this.deviation * this.random();
    }

    update(height: number, delta: number): boolean {
        this.frame += delta;
        this.x += this.dx * delta;
        this.y += this.dy * delta;
        this.theta += this.dTheta * delta;
        let phi = this.frame % 7777 / 7777;
        let i = 0, j = 1;
        while (phi >= this.splineX[j]) i = j++;
        let rho = this.interpolation(
            this.splineY[i],
            this.splineY[j],
            (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i])
        );
        phi *= this.PI2;

        this.outer.style.left = this.x + rho * this.cos(phi) + 'px';
        this.outer.style.top = this.y + rho * this.sin(phi) + 'px';
        this.inner.style.transform = this.axis + this.theta + 'deg)';
        return this.y > height + this.deviation;
    }
}

class ConfettiGenerator {
    private timer: ReturnType<typeof setTimeout> | undefined;
    private frame: number | undefined;
    private confetti: Confetto[] = [];
    private _spread: number = 40;

    private colorThemes: (() => any)[] = [
        () => 'rgb(' + (200 * Math.random() | 0) + ',' + (200 * Math.random() | 0) + ',' + (200 * Math.random() | 0) + ')',
        () => {
            const black = 200 * Math.random() | 0;
            return 'rgb(200,' + black + ',' + black + ')';
        },
        () => {
            const black = 200 * Math.random() | 0;
            return 'rgb(' + black + ',200,' + black + ')';
        },
        () => {
            const black = 200 * Math.random() | 0;
            return 'rgb(' + black + ',' + black + ',200)';
        },
        () => 'rgb(200,100,' + (200 * Math.random() | 0) + ')',
        () => 'rgb(' + (200 * Math.random() | 0) + ',200,200)',
        () => {
            const black = 256 * Math.random() | 0;
            return 'rgb(' + black + ',' + black + ',' + black + ')';
        },
        () => this.colorThemes[Math.random() < .5 ? 1 : 2](),
        () => this.colorThemes[Math.random() < .5 ? 3 : 5](),
        () => this.colorThemes[Math.random() < .5 ? 2 : 4]()
    ];

    constructor() {
        this.poof();
    }

    private poof() {
        if (!this.frame) {
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '0';
            container.style.overflow = 'visible';
            container.style.zIndex = '9999';

            document.body.appendChild(container);
            const theme = this.colorThemes[0];
            let _count: number = 0;
            (function addConfetto() {
                const outer = document.createElement('div');
                const inner = document.createElement('div');
                const confetto = new Confetto(outer, inner, theme);
                container.appendChild(outer);
                outer.appendChild(inner);
                this.confetti.push(confetto);
                this.timer = setTimeout(addConfetto, this.spread * Math.random());
            })(0);
            let prev = undefined;
            requestAnimationFrame((timestamp) => {
                const loop = (timestamp: number) => {
                    const delta = prev ? timestamp - prev : 0;
                    prev = timestamp;
                    const height = window.innerHeight;
                    for (let i = this.confetti.length - 1; i >= 0; --i) {
                        if (this.confetti[i].update(height, delta)) {
                            container.removeChild(this.confetti[i].outer);
                            this.confetti.splice(i, 1);
                        }
                    }
                    if (this.timer || this.confetti.length)
                        return this.frame = requestAnimationFrame(loop);
                    document.body.removeChild(container);
                    this.frame = undefined;
                };
                loop(timestamp);
            });
        }
    }
}