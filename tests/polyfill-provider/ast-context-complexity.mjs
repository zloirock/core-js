// Context queries must stop at the boundary that answers them. Count syntax-slot
// and parent reads after parsing, outside the parser's own traversal and scope setup.
import {
  collectFileCensus, isForXWriteTarget, isTopLevelThisContext, walkAstNodes,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('ast-context-complexity');

for (const parser of adapters) {
  // Repeated calls of one wide reader must inspect its parameter shape once, not per call.
  for (const size of [32, 128]) {
    const params = ['o', ...Array.from({ length: size }, (unused, i) => `p${ i }`)];
    const calls = 'void pick(box);\n'.repeat(size);
    const program = parser.parseAndScope(`function pick(${ params.join(', ') }) { return o.rows; }
      const box = { rows: [8, 9] }; ${ calls } const result = box.rows;`);
    const fn = parser.pickPath(program, 'FunctionDeclaration', p => p.node.id.name === 'pick').node;
    const result = parser.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result').get('init');
    const descriptors = fn.params.map(param => Object.getOwnPropertyDescriptor(param, 'type'));
    let reads = 0;
    fn.params.forEach((param, index) => Object.defineProperty(param, 'type', {
      configurable: true,
      enumerable: descriptors[index].enumerable,
      get() { reads++; return descriptors[index].value; },
    }));
    try {
      const resolver = parser.makeResolver();
      check(`${ parser.name }/local reader/${ size }/field type`, resolver.resolveNodeType(result)?.constructor, 'Array');
      checkTruthy(`${ parser.name }/local reader/${ size }/bounded parameter scans`, reads > 0 && reads <= 40 * (size + 1), `${ reads } parameter reads`);
    } finally {
      fn.params.forEach((param, index) => Object.defineProperty(param, 'type', descriptors[index]));
    }
  }

  for (const depth of [16, 64]) {
    for (const [name, source] of [
      ['function body', 'function local() { this.x; }'],
      ['field value', 'class C { x = this.x; }'],
      ['static block', 'class C { static { this.x; } }'],
    ]) {
      const program = parser.parseAndScope(`${ 'function outer() {'.repeat(depth) }${ source }${ '}'.repeat(depth) }`);
      const path = parser.pickPath(program, 'ThisExpression');
      const ancestors = [];
      for (let current = path; current; current = current.parentPath) ancestors.push(current);
      let reads = 0;
      const descriptors = ancestors.map(current => Object.getOwnPropertyDescriptor(current, 'parentPath'));
      for (const current of ancestors) {
        const { parentPath } = current;
        Object.defineProperty(current, 'parentPath', {
          configurable: true,
          get() { reads++; return parentPath; },
        });
      }
      try {
        check(`${ parser.name }/${ name }/${ depth }/own receiver`, isTopLevelThisContext(path), false);
        checkTruthy(`${ parser.name }/${ name }/${ depth }/bounded ancestry`, reads > 0 && reads <= 12, `${ reads } parent reads`);
      } finally {
        ancestors.forEach((current, index) => {
          if (descriptors[index]) Object.defineProperty(current, 'parentPath', descriptors[index]);
          else delete current.parentPath;
        });
      }
    }
  }

  // An ordinary expression cannot introduce a this owner, regardless of its width.
  // Its absent decorator slot must not be queried once per structural child.
  for (const size of [32, 128]) {
    const source = Array.from({ length: size }, (_, i) => `const x${ i } = this.x + source.value;`).join('\n');
    const program = parser.parseAndScope(source);
    let reads = 0;
    walkAstNodes({ root: program.node, visit(node) {
      Object.defineProperty(node, 'decorators', { configurable: true, enumerable: false, get() { reads++; } });
    } });
    let receivers = 0;
    collectFileCensus(program.node, [{
      visit(node, frame) {
        if (node.type !== 'ThisExpression') return;
        check(`${ parser.name }/${ size }/census receiver ${ receivers++ }`, frame.thisOwner, null);
      },
      result() { return {}; },
    }]);
    check(`${ parser.name }/${ size }/all receivers visited`, receivers, size);
    check(`${ parser.name }/${ size }/no irrelevant slot reads`, reads, 0);
  }

  // Before a member matches a loop head there is no receiver-identity question.
  // Crossing a function must not trigger a full definition-time context census.
  for (const [name, source] of [
    ['no loop', 'function f() { this.at(0); }'],
    ['different slot', 'for (this.other of items) { function f() { this.at(0); } }'],
    ['declaration head', 'for (const item of items) { function f() { this.at(0); } }'],
  ]) {
    const program = parser.parseAndScope(source);
    const path = parser.pickPath(program, 'MemberExpression', p => p.node.property.name === 'at');
    let reads = 0;
    walkAstNodes({ root: program.node, visit(node) {
      Object.defineProperty(node, 'decorators', { configurable: true, enumerable: false, get() { reads++; } });
    } });
    check(`${ parser.name }/${ name }/not a loop write`, isForXWriteTarget(path), false);
    check(`${ parser.name }/${ name }/no irrelevant slot reads`, reads, 0);
  }

  // Descendant data paths and getter descriptors are shared by written refs in one closure.
  // Count property-slot reads after parsing; scans per reference or distinct data key are quadratic.
  // The extra-property writes are valid runtime JS, even though TS rejects the array's unknown key.
  for (const size of [32, 128]) {
    const fields = Array.from({ length: size }, (unused, i) => `p${ i }: 0`).join(', ');
    const writes = Array.from({ length: size }, () => 'box.wrap.inner.value.extra = 0;').join('\n');
    const branches = Array.from({ length: size }, (unused, i) => `p${ i }: { get value() { return [3, 4]; } }`).join(', ');
    const computedBranches = Array.from({ length: size }, (unused, i) => `["p${ i }"]: { get value() { return [3, 4]; } }`).join(', ');
    const branchWrites = Array.from({ length: size }, (unused, i) => `box.inner.p${ i }.value.extra = 0;`).join('\n');
    const reverseWrites = Array.from({ length: size }, (unused, i) => `box.inner.p${ size - i - 1 }.value.extra = 0;`).join('\n');
    for (const [shape, source, statements, resultSource] of [
      ['getter', `const inner = { get value() { return [3, 4]; }, ${ fields } }; const box = { wrap: { inner } };`, writes, 'box.wrap.inner.value'],
      ['carrier', `const inner = { get value() { return [3, 4]; } }; const box = { wrap: { inner, ${ fields } } };`, writes, 'box.wrap.inner.value'],
      ['distinct keys', `const inner = { ${ branches }, marker: 0 }; const box = { inner };`, branchWrites, 'box.inner.p0.value'],
      ['computed keys', `const inner = { rows: [3, 4], ${ computedBranches } }; const box = { inner };`, branchWrites, 'inner.rows'],
      ['reverse keys', `const inner = { ${ branches }, marker: 0 }; const box = { inner };`, reverseWrites, 'box.inner.p0.value'],
    ]) {
      const program = parser.parseAndScope(`${ source } ${ statements } const result = ${ resultSource };`);
      const literal = parser.pickPath(program, 'ObjectExpression', p => p.node.properties.length === size + 1).node;
      const descriptors = literal.properties.map(prop => ['kind', 'key'].map(key => Object.getOwnPropertyDescriptor(prop, key)));
      let reads = 0;
      literal.properties.forEach((prop, index) => {
        for (const [slot, key] of ['kind', 'key'].entries()) {
          const value = prop[key];
          Object.defineProperty(prop, key, {
            configurable: true,
            enumerable: descriptors[index][slot]?.enumerable ?? false,
            get() { reads++; return value; },
          });
        }
      });
      try {
        const result = parser.pickPath(program, 'VariableDeclarator', p => p.node.id?.name === 'result');
        reads = 0;
        check(`${ parser.name }/${ shape }/${ size }/getter result`, parser.makeResolver().resolveNodeType(result.get('init'))?.constructor, 'Array');
        checkTruthy(`${ parser.name }/${ shape }/${ size }/bounded scans`, reads > 0 && reads <= 64 * (size + 1), `${ reads } property-slot reads`);
      } finally {
        literal.properties.forEach((prop, index) => {
          for (const [slot, key] of ['kind', 'key'].entries()) {
            if (descriptors[index][slot]) Object.defineProperty(prop, key, descriptors[index][slot]);
            else delete prop[key];
          }
        });
      }
    }
  }
}

finish();
