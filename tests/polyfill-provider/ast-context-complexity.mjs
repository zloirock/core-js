// Context queries must stop at the boundary that answers them. Count syntax-slot
// and parent reads after parsing, outside the parser's own traversal and scope setup.
import {
  collectFileCensus, isForXWriteTarget, isTopLevelThisContext, walkAstNodes,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('ast-context-complexity');

for (const parser of adapters) {
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
}

finish();
