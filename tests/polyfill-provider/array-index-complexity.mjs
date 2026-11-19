// Repeated indexed reads must not rescan the same binding's whole reference set per read.
// Count member-object and reference-name reads after parsing and scope setup, independently of time.
import { adapters, createChecker } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('array-index-complexity');

for (const parser of adapters) {
  const counts = { members: [], references: [] };
  for (const size of [48, 96, 192]) {
    const program = parser.parseAndScope(`const rows = [[1]]; ${ 'rows[0].at(0);'.repeat(size) }`);
    const paths = parser.collectPaths(program, 'MemberExpression', path => path.node.computed);
    const resolver = parser.makeResolver();
    let reads = 0;
    let names = 0;
    for (const path of paths) {
      const { object } = path.node;
      const { name } = object;
      Object.defineProperty(path.node, 'object', {
        configurable: true, enumerable: true,
        get() { reads++; return object; },
      });
      Object.defineProperty(object, 'name', {
        configurable: true, enumerable: true,
        get() { names++; return name; },
      });
    }
    paths.forEach(path => path.node.object.name);
    check(`${ parser.name }/${ size }/counter control`, reads, size);
    check(`${ parser.name }/${ size }/reference counter control`, names, size);
    reads = 0;
    names = 0;
    for (const path of paths) check(`${ parser.name }/${ size }/indexed receiver`, resolver.resolveNodeType(path)?.constructor, 'Array');
    checkTruthy(`${ parser.name }/${ size }/analysis reads the members`, reads > 0);
    checkTruthy(`${ parser.name }/${ size }/analysis reads the references`, names > 0);
    counts.members.push(reads);
    counts.references.push(names);
  }
  for (const [kind, values] of Object.entries(counts)) for (let at = 1; at < values.length; at++) {
    checkTruthy(`${ parser.name }/${ kind }/doubling reads stays linear/${ at }`, values[at] <= 2.5 * values[at - 1], values.join(' -> '));
  }
}

// A proof belongs to the reference bag and its binding, not to the source spelling alone.
for (const parser of adapters) for (const refresh of ['scope crawl', 'resolver reset']) {
  const program = parser.parseAndScope('const rows = [[1]]; rows.slice(); rows[0]; rows[0];');
  const resolver = parser.makeResolver();
  const paths = parser.collectPaths(program, 'MemberExpression', path => path.node.computed);
  const method = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'slice');
  check(`${ parser.name }/${ refresh }/initial clean references`, resolver.resolveNodeType(paths[0])?.constructor, 'Array');
  method.node.property.name = 'unshift';
  if (refresh === 'scope crawl') program.scope.crawl();
  else resolver.reset();
  const current = parser.collectPaths(program, 'MemberExpression', path => path.node.computed).at(-1);
  check(`${ parser.name }/${ refresh }/new mutator invalidates the proof`, resolver.resolveNodeType(current), null);
}

// A child scope can refresh captured uses without changing the outer binding or reference bag.
for (const parser of adapters) {
  const program = parser.parseAndScope('const rows = [[1]]; function read() { rows.slice(); } read(); rows[0]; rows[0];');
  const resolver = parser.makeResolver();
  const paths = parser.collectPaths(program, 'MemberExpression', path => path.node.computed);
  const binding = program.scope.getBinding('rows');
  const references = binding.referencePaths ?? binding.references;
  const { length } = references;
  check(`${ parser.name }/captured reference/initial read`, resolver.resolveNodeType(paths[0])?.constructor, 'Array');
  parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'slice').node.property.name = 'fill';
  parser.pickPath(program, 'FunctionDeclaration').scope.crawl();
  const current = program.scope.getBinding('rows');
  check(`${ parser.name }/captured reference/binding identity control`, current, binding);
  check(`${ parser.name }/captured reference/bag identity control`, current.referencePaths ?? current.references, references);
  check(`${ parser.name }/captured reference/bag size control`, references.length, length);
  check(`${ parser.name }/captured reference/partial crawl observes the mutator`, resolver.resolveNodeType(paths[1]), null);
}

// Even a write to another slot makes the answer depend on which element is being read.
for (const parser of adapters) for (const alias of [false, true]) {
  const program = parser.parseAndScope(`const rows = [[1], [2]]; ${ alias ? 'const other = rows;' : '' }
    ${ alias ? 'other' : 'rows' }[1] = 'xy'; rows[0].at; rows[1].at;`);
  const resolver = parser.makeResolver();
  const reads = parser.collectPaths(program, 'MemberExpression', path => path.node.property.name === 'at');
  for (const [index, expected] of ['Array', 'string'].entries()) {
    const type = resolver.resolveNodeType(reads[index].get('object'));
    check(`${ parser.name }/${ alias }/slot ${ index }`, type?.primitive ? type.type : type?.constructor, expected);
  }
}

finish();
