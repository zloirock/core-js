// A binding reference query resolves only its spelling, without confusing namesakes.
// The full closure index completes the same census, and reset renews its scope context.
import { adapters, createChecker } from './harness.mjs';
import { createBindingAnalysis } from '../../packages/core-js-polyfill-provider/resolve-node-type/binding-analysis.js';

const { check, checkDeep, checkTruthy, finish } = createChecker('binding-reference-index');

function analysisFor(program) {
  const lookups = new Map();
  const analysis = createBindingAnalysis({
    KNOWN_STATIC_METHOD_RETURN_TYPES: {},
    getScopeBinding({ scope, name }) {
      lookups.set(name, (lookups.get(name) ?? 0) + 1);
      return scope.getBinding(name);
    },
    memoize(cache, key, build) {
      if (!cache.has(key)) cache.set(key, build());
      return cache.get(key);
    },
    findProgramPath() { return program; },
  });
  return { analysis, lookups };
}

for (const parser of adapters) for (const size of [32, 128]) {
  const source = `function read(value = []) { return value; } read();
    ${ Array.from({ length: size }, (_, index) => `const noise${ index } = ${ index }; void noise${ index };`).join('\n') }`;
  const program = parser.parseAndScope(source);
  const { analysis, lookups } = analysisFor(program);
  const binding = program.scope.getBinding('read');
  const partial = analysis.buildProgramIndex(program, 'read');
  check(`${ parser.name }/${ size }/reference count`, partial.identifierByBinding.get(binding)?.length, 1);
  checkDeep(`${ parser.name }/${ size }/only the requested spelling is resolved`, [...lookups], [['read', 1]]);
  check(`${ parser.name }/${ size }/same index reused`, analysis.buildProgramIndex(program, 'read'), partial);
  check(`${ parser.name }/${ size }/repeated query does no work`, lookups.get('read'), 1);
  analysis.buildProgramIndex(program, 'absent');
  check(`${ parser.name }/${ size }/absent spelling does no work`, lookups.has('absent'), false);
  const complete = analysis.buildProgramIndex(program);
  check(`${ parser.name }/${ size }/full query completes the same index`, complete, partial);
  check(`${ parser.name }/${ size }/full query keeps the first answer`, lookups.get('read'), 1);
  check(`${ parser.name }/${ size }/counter control: full query resolves other names`, lookups.get(`noise${ size - 1 }`), 1);
  check(`${ parser.name }/${ size }/full reference count`, complete.identifierByBinding.size, size + 2);
  const resolved = lookups.entries().toArray();
  analysis.buildProgramIndex(program);
  checkDeep(`${ parser.name }/${ size }/completed query does no work`, lookups.entries().toArray(), resolved);
  analysis.reset({ currentTreeReferences: true });
  lookups.clear();
  check(`${ parser.name }/${ size }/reference consumer finds the call`, analysis.collectBindingReferences(binding, program)?.length, 1);
  checkDeep(`${ parser.name }/${ size }/reference consumer keeps the query narrow`, [...lookups], [['read', 1]]);
}

// Both query orders cover the same bindings, including references under TS and JSX wrappers.
for (const parser of adapters) for (const order of [['first', null], [null, 'first']]) {
  const program = parser.parseAndScope('const first = []; const Second = () => null; void (first as unknown); void <Second />;', 'module', ['jsx']);
  const { analysis } = analysisFor(program);
  for (const name of order) analysis.buildProgramIndex(program, name);
  const complete = analysis.buildProgramIndex(program);
  for (const name of ['first', 'Second']) {
    const binding = program.scope.getBinding(name);
    check(`${ parser.name }/${ order.join('/') }/${ name }/wrapped reference`, complete.identifierByBinding.get(binding)?.length, 1);
    check(`${ parser.name }/${ order.join('/') }/${ name }/declaration lookup`, complete.bindingByDeclaration.get(binding.path.node)?.get(name), binding);
  }
}

for (const parser of adapters) {
  const source = 'const item = []; void item; { const item = "x"; void item; }';
  const program = parser.parseAndScope(source);
  const { analysis } = analysisFor(program);
  const index = analysis.buildProgramIndex(program, 'item');
  check(`${ parser.name }/namesakes stay separate`, index.identifierByBinding.size, 2);
  checkDeep(`${ parser.name }/each namesake has its own read`, index.identifierByBinding.values().map(paths => paths.length).toArray(), [1, 1]);
  const declarations = index.identifierByBinding.keys().map(binding => binding.path.node);
  check(`${ parser.name }/declaration identities stay separate`, new Set(declarations).size, 2);
  for (const [binding, paths] of index.identifierByBinding) {
    check(`${ parser.name }/reference resolves to its own binding`, paths[0].scope.getBinding('item'), binding);
    check(`${ parser.name }/equivalent view lookup`, index.bindingByDeclaration.get(binding.path.node)?.get('item'), binding);
  }
}

// A fresh scope context over the same source nodes must not reuse an earlier reference set.
for (const parser of adapters) {
  const program = parser.parseAndScope('const first = []; const second = []; void first; void second;');
  const { analysis, lookups } = analysisFor(program);
  const first = program.scope.getBinding('first');
  const initial = analysis.buildProgramIndex(program, 'first');
  check(`${ parser.name }/initial source reference`, initial.identifierByBinding.get(first)?.length, 1);
  const use = parser.pickPath(program, 'Identifier', path => path.node.name === 'second' && path.parent.type === 'UnaryExpression');
  use.node.name = 'first';
  program.scope.crawl();
  analysis.reset({ currentTreeReferences: true });
  const rebuilt = analysis.buildProgramIndex(program, 'first');
  checkTruthy(`${ parser.name }/reset replaces the index`, rebuilt !== initial);
  check(`${ parser.name }/reset resolves both live references`, rebuilt.identifierByBinding.get(program.scope.getBinding('first'))?.length, 2);
  checkTruthy(`${ parser.name }/reset repeats required scope work`, lookups.get('first') > 1);
}

finish();
