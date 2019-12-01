const canvas = document.createElement('canvas');
canvas.height = 500;
canvas.width = 500;

const ctx = canvas.getContext('2d');

document.body.appendChild(canvas);

interface Point { x: number, y: number };

interface Tile {
  id: string;
  draw(ctx: CanvasRenderingContext2D, point: Point, size: number): void;
  getLeftNeighbours(): string[];
  getTopNeighbours(): string[];
  getRightNeighbours(): string[];
  getBottomNeighbours(): string[];
}

let motherTile = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
];

// for (let i = 0;i<motherTile.length;i++) {
//   const row = motherTile[i];
//   row.unshift(0);
//   row.unshift(0);

//   row.push(0);
//   row.push(0);
// }

// let a = [];
// for (let i = 0;i<motherTile.length+4;i++) {
//   a.push(0);
// }

// motherTile.unshift(a);
// motherTile.unshift(a);

// motherTile.push(a);
// motherTile.push(a);

const subTileSize = 2;

class Subtile {
  pattern: number[][];
  signature: string;
  topNeighbour: Subtile[];
  bottomNeighbour: Subtile[];
  leftNeighbour: Subtile[];
  rightNeighbour: Subtile[];

  constructor(pattern: number[][]) {
    this.pattern = pattern;
    this.signature = createSignature(pattern);
  }

  render = (ctx: CanvasRenderingContext2D, point: Point, size: number) => {
    for (let y = 0;y<this.pattern.length;y++) {
      for (let x = 0; x < this.pattern[y].length;x++) {
        if (this.pattern[y][x] === 1) {
          ctx.fillStyle = '#000000';
        } else {
          ctx.fillStyle = '#FFFFFF';
        }
        ctx.fillRect(point.x + x*size, point.y + y*size, size, size);
      }
    }
  }
}

const findNeighbours = (y: number, x: number, grid: Subtile[][]) => {
  let indices = [{ x: -1, y: 0}, { x: 0, y: -1}, { x: 1, y: 0}, {x: 0, y: 1}];
  const tile = grid[y][x];
  indices.forEach(index => {
    let row = grid[y + index.y];
    const cell = row ? row[x + index.x] : undefined;
    if (index.x < 0) {
      tile.leftNeighbour = cell ? [cell] : [];
    }
    if (index.x > 0){
      tile.rightNeighbour = cell ? [cell] : [];
    }
    if (index.y < 0) {
      tile.topNeighbour = cell ? [cell] : [];
    }
    if (index.y > 0){
      tile.bottomNeighbour = cell ? [cell] : [];
    }
  });
}

const createSignature = (subtile: number[][]) => {
  let signature = '';

  for (let y = 0;y<subtile.length;y++) {
    for (let x = 0; x < subtile[y].length;x++) {
      signature += `${y}${x}${subtile[y][x]}`
    }
  }
  return signature;
}

const subtiles: Subtile[][] = [];

for (let y = 0; y < motherTile.length; y += subTileSize) {
  const subtileRow: Subtile[] = [];
  for (let x = 0; x < motherTile.length; x += subTileSize) {
    let sub = [];
    for (let sy = y; sy < y + subTileSize; sy++) {
      let row = [];
      for (let sx = x; sx < x + subTileSize; sx++) {
        row.push(motherTile[sy][sx]);
      }
      sub.push(row);
    }
    subtileRow.push(new Subtile(sub));
  }
  subtiles.push(subtileRow)
}

for (let y = 0; y < subtiles.length;y++) {
  for (let x = 0; x < subtiles[y].length;x++) {
    findNeighbours(y, x, subtiles);
  }
}

const copyArray = (arr: any[]) => {
  if (!arr) return [];
  return [...arr];
}

const rotate90Degrees = (tile: Subtile) => {
  const pattern = [
    [tile.pattern[1][0], tile.pattern[0][0]],
    [tile.pattern[1][1], tile.pattern[0][1]]
  ]
  const rotated = new Subtile(pattern);
  rotated.rightNeighbour = copyArray(tile.topNeighbour);
  rotated.bottomNeighbour = copyArray(tile.rightNeighbour);
  rotated.leftNeighbour = copyArray(tile.bottomNeighbour);
  rotated.topNeighbour = copyArray(tile.leftNeighbour);

  return rotated;
}

const rotate180Degrees = (tile: Subtile) => {
  const pattern = [
    [tile.pattern[1][1], tile.pattern[1][0]],
    [tile.pattern[0][1], tile.pattern[0][0]]
  ]
  const rotated = new Subtile(pattern);
  rotated.rightNeighbour = copyArray(tile.leftNeighbour);
  rotated.bottomNeighbour = copyArray(tile.topNeighbour);
  rotated.leftNeighbour = copyArray(tile.rightNeighbour);
  rotated.topNeighbour = copyArray(tile.bottomNeighbour);

  return rotated;
}

const rotate270Degrees = (tile: Subtile) => {
  const pattern = [
    [tile.pattern[0][1], tile.pattern[1][1]],
    [tile.pattern[0][0], tile.pattern[1][0]]
  ]
  const rotated = new Subtile(pattern);
  rotated.rightNeighbour = copyArray(tile.bottomNeighbour);
  rotated.bottomNeighbour = copyArray(tile.leftNeighbour);
  rotated.leftNeighbour = copyArray(tile.topNeighbour);
  rotated.topNeighbour = copyArray(tile.rightNeighbour);

  return rotated;
}

let flat = subtiles.reduce((arr, row) => [...arr, ...row], []);

const rotated90 = flat.reduce((arr, value) => {
  const rot = rotate90Degrees(value);
  arr.push(rot);
  return arr;
}, [])

const rotated180 = flat.reduce((arr, value) => {
  const rot = rotate180Degrees(value);
  arr.push(rot);
  return arr;
}, []);

const rotated270 = flat.reduce((arr, value) => {
  const rot = rotate270Degrees(value);
  arr.push(rot);
  return arr;
}, []);

flat = flat.concat(rotated90);
flat = flat.concat(rotated180);
flat = flat.concat(rotated270);

const grouped = flat.reduce((dict, element) => {
  const atSignature = dict[element.signature] as Subtile;
  if (atSignature) {
    atSignature.topNeighbour = [...atSignature.topNeighbour, ...element.topNeighbour];
    atSignature.bottomNeighbour = [...atSignature.bottomNeighbour, ...element.bottomNeighbour];
    atSignature.leftNeighbour = [...atSignature.leftNeighbour, ...element.leftNeighbour];
    atSignature.rightNeighbour = [...atSignature.rightNeighbour, ...element.rightNeighbour];
  } else {
    dict[element.signature] = element;
  } 
  return dict;
}, {});

const groupedArray: Subtile[] = Object.keys(grouped).map(key => grouped[key]);

const size = 4;
const start = { x: 20, y: 20 };

const randomElement = <T>(arr: T[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
}

const gridSize = 100;
const tiles: Subtile[][] = [];

for (let y = 0; y < gridSize; y++) {
  const row: Subtile[] = [];
  for (let x = 0; x < gridSize; x++) {
    const leftNeighbour = row[x-1];
    const topNeighbour = tiles[y-1] && tiles[y-1][x];
    if (leftNeighbour && topNeighbour) {
      const l = groupedArray.find(x => leftNeighbour.signature === x. signature);
      const t = groupedArray.find(x => leftNeighbour.signature === x. signature);
      
      const intersection = l.rightNeighbour.filter(n => {
        t.bottomNeighbour.indexOf(n) >= 0;
      });
      if (intersection.length === 0) {
        row.push(randomElement<Subtile>(l.rightNeighbour));
      } else {
        row.push(randomElement<Subtile>(intersection));
      }
    }else {   
      if (leftNeighbour) {
        const t = groupedArray.find(x => leftNeighbour.signature === x. signature);
        row.push(randomElement<Subtile>(t.rightNeighbour));
      } else {
        row.push(groupedArray[Math.floor(Math.random() * groupedArray.length)]);
      }
    }
  }
  tiles.push(row);
}

for (let y = 0; y < gridSize; y++) {
  for (let x = 0; x < gridSize; x++) {
    tiles[y][x].render(ctx, { x: x * size * 2, y: y*size * 2 }, size);
  }
}
