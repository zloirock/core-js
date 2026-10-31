// Two literal receivers in one declaration keep independent captures.
const { [Symbol.iterator]: { next: nx = [1].findLast(Boolean) } } = [14], { [Symbol.iterator]: { name: ny = [2].findLastIndex(Boolean) } } = [15];

export const viaTwoMemos = [nx, ny];
