// Cross-parser tests for `arrayWrapperResidualDroppable`, the rule both emitters consult before an
// array-wrapper residual leaves. The question is COERCION, not binding: an element pattern coerces
// its own value wherever it stands (`const [{}] = [x]` throws on a nullish `x`), so the wrapper may
// only leave when every element is a hole or one a claim covered - there the extraction repeats
// that coercion in its place. Both emitters hand it the same fact set, so both parsers must agree.
import { arrayWrapperResidualDroppable } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, finish, runBoth } = createChecker('array-wrapper-drop');

// the elements a claim covered, addressed the way each emitter addresses them: by node identity
function elementsOf(adapter, prog) {
  const declarator = adapter.pickPath(prog, 'VariableDeclarator');
  return { pattern: declarator.node.id, elements: declarator.node.id.elements };
}

runBoth('sole element, claimed', 'const [{ at }] = [arr];', (adapter, prog, lbl) => {
  const { pattern, elements } = elementsOf(adapter, prog);
  check(lbl, arrayWrapperResidualDroppable(pattern, new Set([elements[0]])), true);
});

runBoth('sole element, unclaimed', 'const [{ at }] = [arr];', (adapter, prog, lbl) => {
  const { pattern } = elementsOf(adapter, prog);
  check(lbl, arrayWrapperResidualDroppable(pattern, new Set()), false);
});

runBoth('every element claimed', 'const [{ at }, { keys }] = [a, b];', (adapter, prog, lbl) => {
  const { pattern, elements } = elementsOf(adapter, prog);
  check(lbl, arrayWrapperResidualDroppable(pattern, new Set(elements)), true);
});

// the one that matters: a sibling element nobody claimed still coerces
runBoth('one of two elements claimed', 'const [{}, { at }] = [x, arr];', (adapter, prog, lbl) => {
  const { pattern, elements } = elementsOf(adapter, prog);
  check(lbl, arrayWrapperResidualDroppable(pattern, new Set([elements[1]])), false);
});

// a HOLE coerces nothing, so it never holds the wrapper back
runBoth('hole beside a claimed element', 'const [, { at }] = [x, arr];', (adapter, prog, lbl) => {
  const { pattern, elements } = elementsOf(adapter, prog);
  check(lbl, arrayWrapperResidualDroppable(pattern, new Set([elements[1]])), true);
});

// a REST element is neither a hole nor claimable - it gathers the array itself
runBoth('rest element', 'const [{ at }, ...rest] = [arr, 1];', (adapter, prog, lbl) => {
  const { pattern, elements } = elementsOf(adapter, prog);
  check(lbl, arrayWrapperResidualDroppable(pattern, new Set([elements[0]])), false);
});

// an element DEFAULT is transparent: what a claim covers is the pattern under it
runBoth('defaulted element', 'const [{ at } = {}] = [arr];', (adapter, prog, lbl) => {
  const { pattern, elements } = elementsOf(adapter, prog);
  check(`${ lbl }/by the default`, arrayWrapperResidualDroppable(pattern, new Set([elements[0]])), true);
  check(`${ lbl }/by the pattern under it`,
    arrayWrapperResidualDroppable(pattern, new Set([elements[0].left])), true);
});

// a wrapper CHAIN coerces once per level, and the extraction repeats every level it descended
runBoth('nested wrapper chain', 'const [[{ at }]] = [[arr]];', (adapter, prog, lbl) => {
  const { pattern, elements } = elementsOf(adapter, prog);
  check(`${ lbl }/inner claimed`,
    arrayWrapperResidualDroppable(pattern, new Set([elements[0].elements[0]])), true);
  check(`${ lbl }/nothing claimed`, arrayWrapperResidualDroppable(pattern, new Set()), false);
});

// an EMPTY wrapper still iterates its value, and no extraction stands in for that
runBoth('empty wrapper', 'const [] = [arr];', (adapter, prog, lbl) => {
  const { pattern } = elementsOf(adapter, prog);
  check(lbl, arrayWrapperResidualDroppable(pattern, new Set()), false);
});

// NEGATIVE: an object pattern is not a wrapper at all
runBoth('object pattern host', 'const { at } = arr;', (adapter, prog, lbl) => {
  const declarator = adapter.pickPath(prog, 'VariableDeclarator');
  check(lbl, arrayWrapperResidualDroppable(declarator.node.id, new Set()), false);
});

finish();
