// A live declarator path answers loop-head ownership without indexing unrelated bodies.
import { reassignmentValueEnumeration, walkAstNodes } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker, expectError } from './harness.mjs';

const { check, checkDeep, finish } = createChecker('for-x-head-lookups');

const shapes = [
  ['ordinary', 'var value = "a";', ['c'], true],
  ['for-of', 'for (var value of ["a", "b"])', ['a', 'b', 'c'], true],
  ['pattern', 'for (var [value] of [["a"], ["b"]])', ['a', 'b', 'c'], true],
  ['lexical', 'for (let value of ["a", "b"])', ['a', 'b', 'c'], true],
  ['for-in', 'for (var value in { a: 0 })', ['c'], false],
  ['initialized for-in', 'for (var value = "a" in { b: 0 })', ['c'], false],
];

const cases = shapes.flatMap(shape => ['native', 'wrapped', 'lazy', 'missing', 'detached']
  .flatMap(view => [16, 64].map(size => ({ shape, view, size }))));
for (const parser of adapters) {
  for (const { shape: row, view, size } of cases) {
    const [shape, head, expected, complete] = row;
    const body = `function nested() { ${ 'sink(0);'.repeat(size) } } value = "c"; use(value);`;
    const intent = expectError(shape === 'initialized for-in' ? 'Sloppy JS permits an initializer in a var for-in head' : null);
    const program = parser.parseAndScope(`${ intent }function run() { ${ head } ${ shape === 'ordinary' ? body : `{ ${ body } }` } }`, 'script');
    const declaration = parser.pickPath(program, 'VariableDeclarator');
    const use = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'use');
    const assignment = parser.pickPath(program, 'AssignmentExpression');
    const native = use.scope.getBinding('value');
    const binding = { scope: native.scope, kind: native.kind, constantViolations: [assignment.node] };
    if (view === 'native') binding.path = declaration;
    else {
      binding.node = declaration.node;
      switch (view) {
        case 'wrapped': binding.declarationPath = declaration; break;
        case 'lazy': binding.resolveDeclaratorPath = () => declaration; break;
        case 'detached': {
          const parentPath = Object.create(declaration.parentPath, {
            node: { value: { ...declaration.parentPath.node, declarations: [] } },
          });
          binding.declarationPath = Object.create(declaration, { parentPath: { value: parentPath } });
          break;
        }
      }
    }
    const nested = parser.pickPath(program, 'FunctionDeclaration', path => path.node.id.name === 'nested').node;
    let visits = 0;
    for (const node of nested.body.body) Object.defineProperty(node, 'writeIndexProbe', {
      configurable: true, enumerable: true, get() { visits++; return null; },
    });
    const label = `${ parser.name }/${ size }/${ shape }/${ view }`;
    try {
      walkAstNodes({ root: nested.body, visit() { return true; } });
      check(`${ label }/counter control`, visits, size);
      visits = 0;
      const result = reassignmentValueEnumeration({ binding, usagePath: use, name: 'value', everyWrite: true, countDeadWrites: true });
      checkDeep(`${ label }/values`, result.nodes.map(node => node.value), expected);
      check(`${ label }/complete`, result.complete, complete);
      check(`${ label }/fallback walk`, visits > 0, view === 'missing' || view === 'detached');
    } finally {
      for (const node of nested.body.body) delete node.writeIndexProbe;
    }
  }
}

for (const parser of adapters) {
  const program = parser.parseAndScope('function run() { var value; for (var other of ["a", "b"]) {} value = "c"; use(value); }');
  const [declaration, other] = parser.collectPaths(program, 'VariableDeclarator');
  const use = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'use');
  const assignment = parser.pickPath(program, 'AssignmentExpression');
  const native = use.scope.getBinding('value');
  const binding = { node: declaration.node, declarationPath: other, scope: native.scope, kind: native.kind, constantViolations: [assignment.node] };
  function ask() {
    return reassignmentValueEnumeration({ binding, usagePath: use, name: 'value', everyWrite: true, countDeadWrites: true });
  }
  checkDeep(`${ parser.name }/foreign declarator hint`, ask().nodes.map(node => node.value), ['c']);

  // Source snapshots can retain a node that the live path places in a different owner.
  const loop = parser.pickPath(program, 'ForOfStatement').node;
  const snapshot = { ...loop, left: { ...loop.left, declarations: [declaration.node] } };
  binding.declarationPath = declaration;
  binding.scope = { block: snapshot };
  checkDeep(`${ parser.name }/source owner differs from live path`, ask().nodes.map(node => node.value), ['a', 'b', 'c']);

  // A lookup rooted below the loop does not acquire its outside head from a path hint.
  binding.node = other.node;
  binding.declarationPath = other;
  binding.scope = { block: other.parentPath.node };
  checkDeep(`${ parser.name }/source root below loop`, ask().nodes.map(node => node.value), ['c']);
}

finish();
