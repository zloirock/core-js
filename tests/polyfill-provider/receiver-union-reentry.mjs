// Self-reading writes must not enumerate the same binding again until the depth ceiling.
import { adapters, createChecker } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('receiver-union-reentry');
const LIMIT = 20000;

function probe(parser, shape, size) {
  const writes = Array.from({ length: size }, (unused, index) => `v = ${ shape(index) };`).join('\n');
  const program = parser.parseAndScope(`let v = input; ${ writes } v.at(0);`);
  const member = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'at');
  let reads = 0;
  const overflow = new Error('write-read budget exceeded');
  for (const write of parser.collectPaths(program, 'AssignmentExpression')) {
    const { right } = write.node;
    Object.defineProperty(write.node, 'right', { configurable: true, enumerable: true, get() {
      if (++reads > LIMIT) throw overflow;
      return right;
    } });
  }
  try {
    const resolver = parser.makeResolver();
    const hints = resolver.resolvePropertyUnionHints(member);
    return { reads, hints };
  } catch (error) {
    if (error !== overflow) throw error;
    return { reads: null };
  }
}

for (const parser of adapters) for (const [name, shape] of [
  ['normalization', index => `options.k${ index } ? v : v.trim()`],
  ['logical fallback', index => `v || fallback${ index }`],
  ['array filter', index => `options.k${ index } ? v : v.filter(predicate)`],
  ['self predicate', index => `v.length > ${ index } ? v : v.concat(${ index })`],
]) {
  const label = `${ parser.name }/${ name }`;
  const short = probe(parser, shape, 3);
  const long = probe(parser, shape, 6);
  checkTruthy(`${ label }/short query completes`, short.reads !== null);
  checkTruthy(`${ label }/long query completes`, long.reads !== null);
  if (short.reads === null || long.reads === null) continue;
  check(`${ label }/short open answer`, short.hints, null);
  check(`${ label }/long open answer`, long.hints, null);
  checkTruthy(`${ label }/counter control`, short.reads > 0);
  checkTruthy(`${ label }/bounded growth`, long.reads <= short.reads * 6, `${ short.reads } -> ${ long.reads }`);
}

// Separate aliases and shadows must not be mistaken for a scalar write cycle.
for (const parser of adapters) for (const [source, expected] of [
  ['let value = "ab"; if (flag) value = [3]; value.at(0);', 'array,string'],
  ['const pair = flag ? "ab" : [3]; const value = pair; value.at(0);', 'array,string'],
  ['let value = "ab"; if (flag) value = [3]; { const value = flag ? [4] : "cd"; value.at(0); }', 'array,string'],
]) {
  const tree = parser.parseAndScope(source);
  const member = parser.pickPath(tree, 'MemberExpression');
  const resolver = parser.makeResolver();
  const first = resolver.resolvePropertyUnionHints(member);
  check(`${ parser.name }/closed union/${ source }`, first && [...first].sort().join(','), expected);
  const second = resolver.resolvePropertyUnionHints(member);
  check(`${ parser.name }/repeated closed union/${ source }`, second && [...second].sort().join(','), expected);
}

// Interrupt every read of a noncyclic write, then ask again without resetting the resolver.
// A leaked in-flight binding would turn the closed array/string answer into an open set.
for (const parser of adapters) {
  let total;
  for (let interrupt = 0; interrupt <= (total ?? 0); interrupt++) {
    const tree = parser.parseAndScope('let value = "ab"; if (flag) value = [3]; value.at(0);');
    const member = parser.pickPath(tree, 'MemberExpression');
    const write = parser.pickPath(tree, 'AssignmentExpression').node;
    const { right } = write;
    let reads = 0;
    let throwing = interrupt !== 0;
    const failure = new Error('interrupted union');
    Object.defineProperty(write, 'right', {
      configurable: true,
      enumerable: true,
      get() {
        if (++reads === interrupt && throwing) throw failure;
        return right;
      },
    });
    const resolver = parser.makeResolver();
    let caught;
    try {
      resolver.resolvePropertyUnionHints(member);
    } catch (error) {
      caught = error;
    }
    if (!interrupt) {
      total = reads;
      checkTruthy(`${ parser.name }/throw counter control`, total > 0);
    } else check(`${ parser.name }/interrupted read ${ interrupt }`, caught, failure);
    throwing = false;
    const hints = resolver.resolvePropertyUnionHints(member);
    check(`${ parser.name }/retry read ${ interrupt }`, hints && [...hints].sort().join(','), 'array,string');
  }
}

finish();
