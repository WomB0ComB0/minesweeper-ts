// Types and Interfaces
interface GameState {
  width: number;
  bombAmount: number;
  flags: number;
  squares: HTMLDivElement[];
  isGameOver: boolean;
}

interface SoundEffects {
  click: HTMLAudioElement;
  bomb: HTMLAudioElement;
  win: HTMLAudioElement;
  flag: HTMLAudioElement;
}

interface ConfettiParticle {
  frame: number;
  outer: HTMLDivElement;
  inner: HTMLDivElement;
  axis: string;
  theta: number;
  dTheta: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  splineX: number[];
  splineY: number[];
  update: (height: number, delta: number) => boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';
type SquareType = 'bomb' | 'valid';
type ColorThemeFunction = () => string;

// Game state
const gameState: GameState = {
  width: 10,
  bombAmount: 20,
  flags: 0,
  squares: [],
  isGameOver: false
};

// Sound effects
const soundEffects: SoundEffects = {
  click: new Audio('./assets/Music/click.mp3'),
  bomb: new Audio('./assets/Music/bomb.mp3'),
  win: new Audio('./assets/Music/win.mp3'),
  flag: new Audio('./assets/Music/flag.mp3')
};

// DOM elements
const getRequiredElement = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required element not found: ${selector}`);
  }
  return element;
};

document.addEventListener('DOMContentLoaded', (): void => {
  const grid = getRequiredElement<HTMLDivElement>('.grid');
  const flagsLeft = getRequiredElement<HTMLElement>('#flags-left');
  const result = getRequiredElement<HTMLElement>('#result');
  const form = getRequiredElement<HTMLFormElement>('form');

  form.addEventListener('change', (): void => {
    const checkedInput = document.querySelector<HTMLInputElement>('input[name="difficulty"]:checked');
    if (checkedInput && checkedInput.value) {
      setDifficulty(checkedInput.value as Difficulty);
    }
  });

  function setDifficulty(difficulty: Difficulty): void {
    const squareSize: number = 40; // size of each square in pixels
    
    switch (difficulty) {
      case 'easy':
        gameState.width = 10;
        gameState.bombAmount = 20;
        break;
      case 'medium':
        gameState.width = 15;
        gameState.bombAmount = 50;
        break;
      case 'hard':
        gameState.width = 20;
        gameState.bombAmount = 100;
        break;
    }
    
    const actualSize: number = gameState.width * squareSize;
    grid.style.height = `${actualSize}px`;
    grid.style.width = `${actualSize}px`;
  }

  function createBoard(): void {
    flagsLeft.innerHTML = gameState.bombAmount.toString();
    
    const bombsArray: SquareType[] = Array(gameState.bombAmount).fill('bomb');
    const emptyArray: SquareType[] = Array(gameState.width * gameState.width - gameState.bombAmount).fill('valid');
    const gameArray: SquareType[] = emptyArray.concat(bombsArray);
    const shuffledArray: SquareType[] = gameArray.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < gameState.width * gameState.width; i++) {
      const square = document.createElement('div') as HTMLDivElement;
      square.setAttribute('id', i.toString());
      square.classList.add(shuffledArray[i]);
      grid.appendChild(square);
      gameState.squares.push(square);
      
      square.addEventListener('click', (): void => {
        click(square);
      });
      
      square.addEventListener('contextmenu', (e: MouseEvent): void => {
        e.preventDefault();
        addFlag(square);
      });
    }
    
    // Add numbers to valid squares
    for (let i = 0; i < gameState.squares.length; i++) {
      let total = 0;
      const isLeftEdge: boolean = (i % gameState.width === 0);
      const isRightEdge: boolean = (i % gameState.width === gameState.width - 1);
      
      if (gameState.squares[i].classList.contains('valid')) {
        // Check all 8 surrounding squares
        const checks: Array<{ condition: boolean; index: number }> = [
          { condition: i > 0 && !isLeftEdge, index: i - 1 },
          { condition: i > gameState.width - 1 && !isRightEdge, index: i + 1 - gameState.width },
          { condition: i > gameState.width, index: i - gameState.width },
          { condition: i > gameState.width && !isLeftEdge, index: i - 1 - gameState.width },
          { condition: i < gameState.width * gameState.width - 1 && !isRightEdge, index: i + 1 },
          { condition: i < gameState.width * (gameState.width - 1) && !isLeftEdge, index: i - 1 + gameState.width },
          { condition: i < gameState.width * (gameState.width - 1) - 1 && !isRightEdge, index: i + 1 + gameState.width },
          { condition: i < gameState.width * (gameState.width - 1), index: i + gameState.width }
        ];
        
        checks.forEach(({ condition, index }) => {
          if (condition && gameState.squares[index]?.classList.contains('bomb')) {
            total++;
          }
        });
        
        gameState.squares[i].setAttribute('data', total.toString());
      }
    }
  }

  function addFlag(square: HTMLDivElement): void {
    if (gameState.isGameOver) return;
    
    if (!square.classList.contains('checked') && (gameState.flags < gameState.bombAmount)) {
      if (!square.classList.contains('flag')) {
        soundEffects.flag.play();
        square.classList.add('flag');
        square.innerHTML = ' 🚩';
        gameState.flags++;
        flagsLeft.innerHTML = (gameState.bombAmount - gameState.flags).toString();
        checkForWin();
      } else {
        soundEffects.flag.play();
        square.classList.remove('flag');
        square.innerHTML = '';
        gameState.flags--;
        flagsLeft.innerHTML = (gameState.bombAmount - gameState.flags).toString();
      }
    }
  }

  function click(square: HTMLDivElement): void {
    const currentId: number = parseInt(square.id);
    
    if (gameState.isGameOver) return;
    if (square.classList.contains('checked') || square.classList.contains('flag')) return;
    
    if (square.classList.contains('bomb')) {
      soundEffects.bomb.play();
      gameOver();
    } else {
      const totalStr: string | null = square.getAttribute('data');
      const total: number = totalStr ? parseInt(totalStr) : 0;
      
      if (total !== 0) {
        square.classList.add('checked');
        soundEffects.click.play();
        
        const numberClasses: Record<number, string> = {
          1: 'one',
          2: 'two',
          3: 'three',
          4: 'four'
        };
        
        if (numberClasses[total]) {
          square.classList.add(numberClasses[total]);
        }
        
        square.innerHTML = total.toString();
        return;
      }
      
      checkSquare(square, currentId);
    }
    
    square.classList.add('checked');
  }

  function checkSquare(_square: HTMLDivElement, currentId: number): void {
    const isLeftEdge: boolean = (currentId % gameState.width === 0);
    const isRightEdge: boolean = (currentId % gameState.width === gameState.width - 1);
    
    setTimeout((): void => {
      const adjacentChecks: Array<{ condition: boolean; index: number }> = [
        { condition: currentId > 0 && !isLeftEdge, index: currentId - 1 },
        { condition: currentId > gameState.width - 1 && !isRightEdge, index: currentId + 1 - gameState.width },
        { condition: currentId > gameState.width, index: currentId - gameState.width },
        { condition: currentId > gameState.width && !isLeftEdge, index: currentId - 1 - gameState.width },
        { condition: currentId < gameState.width * gameState.width - 1 && !isRightEdge, index: currentId + 1 },
        { condition: currentId < gameState.width * (gameState.width - 1) && !isLeftEdge, index: currentId - 1 + gameState.width },
        { condition: currentId < gameState.width * (gameState.width - 1) - 1 && !isRightEdge, index: currentId + 1 + gameState.width },
        { condition: currentId < gameState.width * (gameState.width - 1), index: currentId + gameState.width }
      ];
      
      adjacentChecks.forEach(({ condition, index }) => {
        if (condition) {
          const newSquare = document.getElementById(index.toString()) as HTMLDivElement | null;
          if (newSquare) {
            click(newSquare);
          }
        }
      });
    }, 10);
  }

  function gameOver(): void {
    result.innerHTML = 'BOOM! Game Over!';
    gameState.isGameOver = true;
    
    gameState.squares.forEach((square: HTMLDivElement): void => {
      if (square.classList.contains('bomb')) {
        square.innerHTML = '💣';
        square.classList.remove('bomb');
        square.classList.add('checked');
      }
    });
  }

  function checkForWin(): void {
    let matches = 0;
    
    for (let i = 0; i < gameState.squares.length; i++) {
      if (gameState.squares[i].classList.contains('flag') && gameState.squares[i].classList.contains('bomb')) {
        matches++;
      }
    }
    
    if (matches === gameState.bombAmount) {
      soundEffects.win.play();
      confettiGenerator();
      result.innerHTML = 'YOU WIN!';
      gameState.isGameOver = true;
    }
  }

  createBoard();
});

function confettiGenerator(): void {
  const random = Math.random;
  const cos = Math.cos;
  const sin = Math.sin;
  const PI = Math.PI;
  const PI2 = PI * 2;
  
  let timer: number | undefined = undefined;
  let frame: number | undefined = undefined;
  const confetti: ConfettiParticle[] = [];
  
  const spread = 40;
  const sizeMin = 3;
  const sizeMax = 12 - sizeMin;
  const eccentricity = 10;
  const deviation = 100;
  const dxThetaMin = -0.1;
  const dxThetaMax = -dxThetaMin - dxThetaMin;
  const dyMin = 0.13;
  const dyMax = 0.18;
  const dThetaMin = 0.4;
  const dThetaMax = 0.7 - dThetaMin;

  const colorThemes: ColorThemeFunction[] = [
    (): string => color(200 * random() | 0, 200 * random() | 0, 200 * random() | 0),
    (): string => {
      const black = 200 * random() | 0;
      return color(200, black, black);
    },
    (): string => {
      const black = 200 * random() | 0;
      return color(black, 200, black);
    },
    (): string => {
      const black = 200 * random() | 0;
      return color(black, black, 200);
    },
    (): string => color(200, 100, 200 * random() | 0),
    (): string => color(200 * random() | 0, 200, 200),
    (): string => {
      const black = 256 * random() | 0;
      return color(black, black, black);
    },
    (): string => colorThemes[random() < 0.5 ? 1 : 2](),
    (): string => colorThemes[random() < 0.5 ? 3 : 5](),
    (): string => colorThemes[random() < 0.5 ? 2 : 4]()
  ];

  function color(r: number, g: number, b: number): string {
    return `rgb(${r},${g},${b})`;
  }

  function interpolation(a: number, b: number, t: number): number {
    return (1 - cos(PI * t)) / 2 * (b - a) + a;
  }

  function createPoisson(): number[] {
    const radius = 1 / eccentricity;
    const radius2 = radius + radius;
    const domain = [radius, 1 - radius];
    let measure = 1 - radius2;
    const spline = [0, 1];

    while (measure) {
        const dart = measure * random();
      let i: number, l: number, interval: number, a: number, b: number;
    
      for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
        a = domain[i];
        b = domain[i + 1];
        interval = b - a;
        if (dart < measure + interval) {
          spline.push(dart + a - measure);
          break;
        }
        measure += interval;
      }

      const c = (dart + a! - measure) - radius;
      const d = (dart + a! - measure) + radius;

      for (i = domain.length - 1; i > 0; i -= 2) {
        l = i - 1;
        a = domain[l];
        b = domain[i];
        if (a >= c && a < d) {
          if (b > d) domain[l] = d;
          else domain.splice(l, 2);
        } else if (a < c && b > c) {
          if (b <= d) domain[i] = c;
          else domain.splice(i, 0, c, d);
        }
      }

      for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
        measure += domain[i + 1] - domain[i];
      }
    }

    return spline.sort();
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '0';
  container.style.overflow = 'visible';
  container.style.zIndex = '9999';

  function Confetto(theme: ColorThemeFunction): ConfettiParticle {
    const particle: ConfettiParticle = {
      frame: 0,
      outer: document.createElement('div'),
      inner: document.createElement('div'),
      axis: '',
      theta: 0,
      dTheta: 0,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      splineX: [],
      splineY: [],
      update: (height: number, delta: number): boolean => {
        particle.frame += delta;
        particle.x += particle.dx * delta;
        particle.y += particle.dy * delta;
        particle.theta += particle.dTheta * delta;

        const phi = particle.frame % 7777 / 7777;
        let i = 0;
        let j = 1;
        while (phi >= particle.splineX[j]) {
          i = j++;
        }
        const rho = interpolation(
          particle.splineY[i],
          particle.splineY[j],
          (phi - particle.splineX[i]) / (particle.splineX[j] - particle.splineX[i])
        );
        const phiRad = phi * PI2;

        particle.outer.style.left = particle.x + rho * cos(phiRad) + 'px';
        particle.outer.style.top = particle.y + rho * sin(phiRad) + 'px';
        particle.inner.style.transform = particle.axis + particle.theta + 'deg)';
        
        return particle.y > height + deviation;
      }
    };

    particle.outer.appendChild(particle.inner);

    const outerStyle = particle.outer.style;
    const innerStyle = particle.inner.style;
    
    outerStyle.position = 'absolute';
    outerStyle.width = (sizeMin + sizeMax * random()) + 'px';
    outerStyle.height = (sizeMin + sizeMax * random()) + 'px';
    innerStyle.width = '100%';
    innerStyle.height = '100%';
    innerStyle.backgroundColor = theme();

    outerStyle.perspective = '50px';
    outerStyle.transform = 'rotate(' + (360 * random()) + 'deg)';
    
    particle.axis = 'rotate3D(' +
      cos(360 * random()) + ',' +
      cos(360 * random()) + ',0,';
    particle.theta = 360 * random();
    particle.dTheta = dThetaMin + dThetaMax * random();
    innerStyle.transform = particle.axis + particle.theta + 'deg)';
    
    particle.x = window.innerWidth * random();
    particle.y = -deviation;
    particle.dx = sin(dxThetaMin + dxThetaMax * random());
    particle.dy = dyMin + dyMax * random();
    outerStyle.left = particle.x + 'px';
    outerStyle.top = particle.y + 'px';

    particle.splineX = createPoisson();
    particle.splineY = [];
    for (let i = 1, l = particle.splineX.length - 1; i < l; ++i) {
      particle.splineY[i] = deviation * random();
    }
    particle.splineY[0] = particle.splineY[particle.splineX.length - 1] = deviation * random();

    return particle;
  }

  function poof(): void {
    if (!frame) {
      document.body.appendChild(container);
      
      const theme = colorThemes[0];
      
      function addConfetto(): void {
        const confetto = Confetto(theme);
        confetti.push(confetto);
        container.appendChild(confetto.outer);
        timer = window.setTimeout(addConfetto, spread * random());
      }
      
      addConfetto();

      let prev: number | undefined = undefined;
      
      function loop(timestamp: number): void {
        const delta = prev ? timestamp - prev : 0;
        prev = timestamp;
        const height = window.innerHeight;
        
        for (let i = confetti.length - 1; i >= 0; --i) {
          if (confetti[i].update(height, delta)) {
            container.removeChild(confetti[i].outer);
            confetti.splice(i, 1);
          }
        }
        
        if (timer || confetti.length) {
          frame = requestAnimationFrame(loop);
        } else {
          document.body.removeChild(container);
          frame = undefined;
        }
      }
      
      requestAnimationFrame(loop);
    }
  }

  poof();
}