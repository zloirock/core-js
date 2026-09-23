// ml-matrix, the matrix type of the mljs machine-learning stack: element-wise math over a matrix and
// the linear algebra behind a solve. Every expected value below is DEFINED by the input or by the
// arithmetic - rounded where engines may differ in the last bit - not observed from a run.
//
// Its reason is the SURFACE axis. Measured on the babel-plugin cells against the union of the eight
// reference baselines before it, `usage-global` adds twelve entries and `usage-pure` thirteen. Eleven
// are `Math` functions the corpus had never reached, each called from the library's own frame by the
// element-wise method of the same name - `cbrt()` over a matrix calls `Math.cbrt` per entry - and each
// check below drives one. `Symbol.for` runs at module load, keying the inspect hook; the pure
// `toExponential` sits in the inspect formatter, which nothing here calls.
//
// It is also the corpus' CommonJS: `ml-matrix` resolves to an ESM wrapper over `matrix.js`, where every
// one of those calls sits, so these baselines are what hold the recorder in `bundle.mjs` to reading in
// front of `commonjs()`.
//
// Nothing here hands an ARRAY to the `Matrix` constructor. `new Matrix([[...]])` copies each row with
// `Float64Array.from`, a typed-array static `usage-pure` cannot serve and IE11 does not have, so the
// pure cells would die at the first matrix on the real engine while every local tier stays green (see
// AGENTS.md). `matrix()` fills an empty one entry by entry instead.
import { Matrix, SingularValueDecomposition, determinant, inverse } from 'ml-matrix';
import { checker } from './checks.mjs';

function round(value, scale = 1e9) {
  return Math.round(value * scale) / scale;
}

function matrix(rows) {
  const result = new Matrix(rows.length, rows[0].length);
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) result.set(i, j, rows[i][j]);
  }
  return result;
}

function pair(a, b) {
  return matrix([[a, b]]);
}

function read(m) {
  const rows = [];
  for (let i = 0; i < m.rows; i++) {
    const row = [];
    for (let j = 0; j < m.columns; j++) row.push(round(m.get(i, j)));
    rows.push(row);
  }
  return rows;
}

export function run() {
  const { checks, check } = checker();

  // --- element-wise: each pair holds an input the function MOVES, so a method handing its matrix back
  // reddens; the odd functions are asked on both signs, and `fround`'s 0.5, exact in float32, is the one
  // value here a function must leave alone ---
  check('acosh', read(pair(1, 2).acosh()), [[0, 1.316957897]]);
  check('asinh', read(pair(-1, 1).asinh()), [[-0.881373587, 0.881373587]]);
  check('atanh', read(pair(-0.5, 0.5).atanh()), [[-0.549306144, 0.549306144]]);
  check('cbrt', read(pair(27, -8).cbrt()), [[3, -2]]);
  check('clz32', read(pair(1, 0).clz32()), [[31, 32]]);
  check('cosh', read(pair(0, 1).cosh()), [[1, 1.543080635]]);
  check('expm1', read(pair(1, -1).expm1()), [[1.718281828, -0.632120559]]);
  check('fround', read(pair(1.1, 0.5).fround()), [[1.100000024, 0.5]]);
  check('log1p', read(pair(1, 2).log1p()), [[0.693147181, 1.098612289]]);
  check('sinh', read(pair(-1, 1).sinh()), [[-1.175201194, 1.175201194]]);
  check('tanh', read(pair(-1, 1).tanh()), [[-0.761594156, 0.761594156]]);

  // --- the algebra: a product with a transpose, a determinant past the 2x2 shortcut, an inverse through
  // the LU solve, and the singular values of a matrix whose diagonal is not its answer ---
  const a = matrix([[1, 2], [3, 4]]);
  check('mmul_transpose', read(a.mmul(a.transpose())), [[5, 11], [11, 25]]);
  check('determinant', determinant(matrix([[2, 0, 1], [1, 3, 2], [1, 1, 2]])), 6);
  check('inverse', read(inverse(matrix([[4, 7], [2, 6]]))), [[0.6, -0.7], [-0.2, 0.4]]);
  // six decimals here: an SVD converges rather than computes, and the ninth sits beside a rounding edge
  const { diagonal } = new SingularValueDecomposition(matrix([[3, 0], [4, 5]]));
  check('singular_values', [round(diagonal[0], 1e6), round(diagonal[1], 1e6)], [6.708204, 2.236068]);

  return { checks };
}
