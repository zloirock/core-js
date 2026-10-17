// Evaluation slots and statement-list nesting must agree across both parser dialects.
import { createChecker } from './harness.mjs';
import {
  noReassignmentReachesUsage, bindingLoopAnchor, reassignmentValueNodes,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';

const { check, checkDeep, runBoth, finish } = createChecker('class-flow-order');

for (const [name, source, expected] of [
  ['static field key', "let key = 'from'; class C { static x = (key = 'of'); static [Array[key]()] = 0; }", true],
  ['instance field key', "let key = 'from'; class C { static x = (key = 'of'); [Array[key]()] = 0; }", true],
  ['method key', "let key = 'from'; class C { static x = (key = 'of'); static [Array[key]()]() {} }", true],
  ['immediate key body', "let key = 'from'; class C { static x = (key = 'of'); static [(() => Array[key]())()] = 0; }", true],
  ['static block write', "let key = 'from'; class C { static { key = 'of'; } static [Array[key]()] = 0; }", true],
  ['earlier outside write', "let key = 'from'; key = 'of'; class C { static [Array[key]()] = 0; }", false],
  ['earlier key write', "let key = 'from'; class C { static [(key = 'of')] = 0; static [Array[key]()] = 0; }", false],
  ['deferred key closure', "let key = 'from'; class C { static x = (key = 'of'); static [(save = () => Array[key](), 'x')] = 0; }", false],
  ['loop field key', "let key = 'from'; for (;;) { class C { static x = (key = 'of'); static [Array[key]()] = 0; } }", false],
  ['loop method key', "let key = 'from'; for (;;) { class C { static x = (key = 'of'); static [Array[key]()]() {} } }", false],
  ['loop immediate key body', "let key = 'from'; for (;;) { class C { static x = (key = 'of'); static [(() => Array[key]())()] = 0; } }", false],
  ['loop nested static block', "let key = 'from'; for (;;) { class Outer { static { class C { static x = (key = 'of'); static [Array[key]()] = 0; } } } }", false],
]) {
  runBoth(name, source, (adapter, program, label) => {
    const usagePath = adapter.pickPath(program, 'MemberExpression', path => path.node.object?.name === 'Array');
    const reassignmentNodes = adapter.collectPaths(program, 'AssignmentExpression', path => path.node.left?.name === 'key').map(path => path.node);
    check(label, noReassignmentReachesUsage({ reassignmentNodes, usagePath, bindingScopeNode: program.node }), expected);
    const binding = usagePath.scope.getBinding('key');
    checkDeep(`${ label }: reachable union values`,
      reassignmentValueNodes({ binding, usagePath }).map(node => node.value), expected ? [] : ['of']);
  });
}

// Recreated block bindings start afresh; a var or copied for-header binding carries the write.
for (const [name, source, expected] of [
  ['fresh body let field', "for (;;) { let key = 'from'; class C { static x = (key = 'of'); static [Array[key]()] = 0; } }", true],
  ['fresh body let method', "for (;;) { let key = 'from'; class C { static x = (key = 'of'); static [Array[key]()]() {} } }", true],
  ['fresh body let immediate call', "for (;;) { let key = 'from'; class C { static x = (key = 'of'); static [(() => Array[key]())()] = 0; } }", true],
  ['fresh for-of binding', "for (let key of ['from']) { class C { static x = (key = 'of'); static [Array[key]()] = 0; } }", true],
  ['outer var survives back-edge', "var key = 'from'; for (;;) { class C { static x = (key = 'of'); static [Array[key]()]() {} } }", false],
  ['header let survives back-edge', "for (let key = 'from';;) { class C { static x = (key = 'of'); static [Array[key]()]() {} } }", false],
]) {
  runBoth(name, source, (adapter, program, label) => {
    const usagePath = adapter.pickPath(program, 'MemberExpression', path => path.node.object?.name === 'Array');
    const binding = usagePath.scope.getBinding('key');
    const reassignmentNodes = adapter.collectPaths(program, 'AssignmentExpression', path => path.node.left?.name === 'key').map(path => path.node);
    check(label, noReassignmentReachesUsage({ reassignmentNodes, usagePath,
      bindingScopeNode: binding.scope.block ?? binding.scope.path.node, bindingAnchor: bindingLoopAnchor(binding) }), expected);
    check(`${ label }: late write in reachable union`,
      reassignmentValueNodes({ binding, usagePath }).some(node => node.value === 'of'), !expected);
  });
}

for (const [name, source, expected] of [
  ['capture before loop', "let key = 'from'; const captured = key; for (;;) { class C { static x = (key = 'of'); static [Array[captured]()] = 0; } }", true],
  ['capture inside loop', "let key = 'from'; for (;;) { const captured = key; class C { static x = (key = 'of'); static [Array[captured]()] = 0; } }", false],
]) {
  runBoth(name, source, (adapter, program, label) => {
    const usagePath = adapter.pickPath(program, 'MemberExpression', path => path.node.object?.name === 'Array');
    const usageNode = adapter.pickPath(program, 'VariableDeclarator', path => path.node.id?.name === 'captured').node.init;
    const binding = usagePath.scope.getBinding('key');
    const reassignmentNodes = adapter.collectPaths(program, 'AssignmentExpression').map(path => path.node);
    check(label, noReassignmentReachesUsage({ reassignmentNodes, usagePath, usageNode,
      bindingScopeNode: program.node, bindingAnchor: bindingLoopAnchor(binding) }), expected);
  });
}

runBoth('class decorator precedes static write', "let key = 'from'; @deco(Array[key]()) class C { static x = (key = 'of'); }",
  (adapter, program, label) => {
    const usagePath = adapter.pickPath(program, 'MemberExpression', path => path.node.object?.name === 'Array');
    const reassignmentNodes = adapter.collectPaths(program, 'AssignmentExpression').map(path => path.node);
    check(label, noReassignmentReachesUsage({ reassignmentNodes, usagePath, bindingScopeNode: program.node }), true);
  }, ['decorators']);

for (const [name, source, expected] of [
  ['capture before write', "let key = 'from'; const captured = key; key = 'of'; function read() { return Array[captured]; }", true],
  ['capture after write', "let key = 'from'; key = 'of'; const captured = key; function read() { return Array[captured]; }", false],
  ['capture in repeated loop', "let key = 'from'; for (;;) { const captured = key; key = 'of'; function read() { return Array[captured]; } }", false],
]) runBoth(`outer capture frame/${ name }`, source, (parser, program, label) => {
  const usagePath = parser.pickPath(program, 'MemberExpression');
  const usageNode = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'captured').node;
  const reassignmentNodes = parser.collectPaths(program, 'AssignmentExpression').map(path => path.node);
  check(label, noReassignmentReachesUsage({ reassignmentNodes, usagePath, usageNode, bindingScopeNode: program.node }), expected);
});

for (const [name, source, expected] of [
  ['alternate nested block', "function f(flag) { let v = 'abc'; if (flag) throw 0; else { { v = [1]; } return v.at(0); } }", [false, 'Array']],
  ['consequent nested block', "function f(flag) { let v = 'abc'; if (flag) { { v = [1]; } return v.at(0); } else throw 0; }", [false, 'Array']],
  ['branch without exit', "function f(flag) { let v = 'abc'; if (flag) { { v = [1]; } return v.at(0); } }", [false, 'Array']],
  ['two nested blocks', "function f(flag) { let v = 'abc'; if (flag) { { { v = [1]; } } return v.at(0); } }", [false, 'Array']],
  ['outside branch', "function f(flag) { let v = 'abc'; if (flag) throw 0; else { { v = [1]; } } return v.at(0); }", [false, 'Array']],
  ['conditional tail write', "function f(flag) { let v = 'abc'; if (flag) { { v = [1]; } if (other) v = 'abc'; return v.at(0); } }", null],
  ['other branch write', "function f(flag) { let v = 'abc'; if (flag) { { v = [1]; } throw 0; } else return v.at(0); }", [true, 'string']],
  ['nested lexical shadow', "function f(flag) { let v = 'abc'; if (flag) { { let v; v = [1]; } return v.at(0); } }", [true, 'string']],
  ['labeled break skips write', "function f(flag) { let v = 'abc'; outer: { { if (flag) break outer; v = [1]; } } return v.at(0); }", null],
  ['loop reassigns after use', "function f(flag) { let v = 'abc'; { v = [1]; } for (;flag;) { use(v.at(0)); v = 'abc'; } }", null],
  ['deferred read', "function f(flag) { let v = 'abc'; { v = [1]; } const read = () => v.at(0); v = 'abc'; return read; }", null],
]) {
  runBoth(name, source, (adapter, program, label) => {
    const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
    const type = adapter.makeResolver().resolveNodeType(member.get('object'));
    checkDeep(label, type ? [type.primitive, type.primitive ? type.type : type.constructor] : null, expected);
  });
}

finish();
