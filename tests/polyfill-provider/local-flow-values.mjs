// Local writes and branch joins have one value at each read, projected to both channels.
// The two query orders must retain all live arms and discard overwritten initializers.
import { adapters, createChecker } from './harness.mjs';
import { withReentrantQuestion } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';

const { check, checkTruthy, checkDeep, finish } = createChecker('local-flow-values');
const cases = [
  [
    'if-else-string',
    'export function read(flag: boolean) { let value: string | string[]; if (flag) value = "a"; else value = "b"; return value.at(0); }',
    'string',
    'string',
  ],
  [
    'if-else-array',
    'export function read(flag: boolean) { let value: string | string[]; if (flag) value = ["a"]; else value = ["b"]; return value.at(0); }',
    'Array',
    'array',
  ],
  [
    'if-else-mixed',
    'export function read(flag: boolean) { let value: string | string[]; if (flag) value = "a"; else value = ["b"]; return value.at(0); }',
    null,
    'array,string',
  ],
  [
    'inferred-join',
    'export function read(flag: boolean) { let value; if (flag) value = "ab"; else value = "cd"; return value.at(0); }',
    'string',
    'string',
  ],
  [
    'overwrite-after-join',
    'export function read(flag: boolean) { let value: string | string[]; if (flag) value = "ab"; else value = "cd"; value = ["ef"]; return value.at(0); }',
    'Array',
    'array',
  ],
  [
    'conditional-write',
    'export function read(flag: boolean) { let value: string | string[] = "ab"; if (flag) value = ["cd"]; return value.at(0); }',
    null,
    'array,string',
  ],
  [
    'nullish-join',
    'export function read(flag: boolean) { let value: string | undefined; if (flag) value = "ab"; else value = undefined; return value?.at(0); }',
    'string',
    'string',
  ],
  [
    'shadowed-local',
    'export function read(flag: boolean) { const value = ["outer"]; { let value: string | string[]; if (flag) value = "ab"; else value = "cd"; return value.at(0); } }',
    'string',
    'string',
  ],
  [
    'initialized-join',
    'export function read(flag: boolean) { let value = flag ? "old" : ["old"]; if (flag) value = ["ab"]; else value = ["cd"]; return value.at(0); }',
    'Array',
    'array',
  ],
  [
    'type-only-name',
    'type Array = { user: true }; export function read() { const value = [1, 2]; return value.at(0); }',
    'Array',
    null,
  ],
  [
    'local-normalization',
    'export function read(input: string | string[]) { let value = input; if (typeof value === "string") value = value.split(","); return value.at(0); }',
    null,
    null,
  ],
  [
    'unknown-call-arm',
    'export function read(flag: boolean, source: () => string | string[]) { let value: string | string[] = "ab"; if (flag) value = source(); return value.at(0); }',
    null,
    'array,string',
  ],
  [
    'closure-after-join',
    'export function read(flag: boolean) { let value: string | string[]; if (flag) value = "ab"; else value = "cd";'
      + 'function mutate() { value = ["ef"]; } mutate(); return value.at(0); }',
    null,
    'array,string',
  ],
  [
    'deferred-read',
    'export function read() { let value: string | string[] = "ab"; const later = () => value.at(0); value = ["cd"]; return later(); }',
    null,
    'array,string',
  ],
  [
    'exceptional-exit',
    'export function read(flag: boolean) { let value: string | string[] = ["old"]; try { if (flag) throw new Error("stop"); value = "ab"; } catch {} return value.at(0); }',
    null,
    'array,string',
  ],
  [
    'loop-local',
    'export function read(input: string | string[]) { let value = input; while (typeof value !== "string") value = value.join(","); return value.at(0); }',
    null,
    null,
  ],
  [
    'latest-complete-join',
    'export function read(a: boolean, b: boolean) { let value: string | string[]; if (a) value = "a"; else value = ["b"];'
      + 'if (b) value = ["c"]; else value = ["d"]; return value.at(0); }',
    'Array',
    'array',
  ],
  [
    'same-name-incomplete-join',
    'export function read(flag: boolean) { let value: string | string[] = ["old"]; if (flag) { let value; value = "inner"; } else value = "outer"; return value.at(0); }',
    null,
    'array,string',
  ],
  [
    'read-in-branch',
    'export function read(flag: boolean) { let value: string | string[] = ["old"]; if (flag) { value = "ab"; return value.at(0); } else value = ["cd"]; return null; }',
    'string',
    'string',
  ],
  [
    'late-opposite-write',
    'export function read(flag: boolean) { let value: string | string[] = "ab"; if (flag) return value.at(0); else value = ["cd"]; return null; }',
    'string',
    'string',
  ],
  [
    'abrupt-arm',
    'export function read(flag: boolean) { let value: string | string[] = ["old"]; if (flag) value = "ab"; else throw new Error("stop"); return value.at(0); }',
    'string',
    'string',
  ],
  [
    'unknown-annotation-arm',
    'export function read(flag: boolean, source: () => unknown) { let value: unknown; if (flag) value = "ab";'
      + 'else value = source();\n// @ts-expect-error the receiver is deliberately unknown\nreturn value.at(0); }',
    null,
    null,
  ],
  [
    'prototype-install',
    'export function read(flag: boolean) { let value: string | string[]; if (flag) value = ["ab"]; else value = ["cd"];'
      + 'Object.setPrototypeOf(value, String.prototype); return value.at(0); }',
    null,
    'array,string',
  ],
  [
    'alias-prototype-install',
    'export function read(flag: boolean) { let value: string | string[]; if (flag) value = ["ab"]; else value = ["cd"];'
      + 'const alias = value; Object.setPrototypeOf(alias, String.prototype); return value.at(0); }',
    null,
    'array,string',
  ],
  [
    'opaque-effect',
    'export function read(flag: boolean, mutate: (value: string[]) => void) { let value: string | string[];'
      + 'if (flag) value = ["ab"]; else value = ["cd"]; mutate(value); return value.at(0); }',
    null,
    'array,string',
  ],
];

for (const [label, source, family, expectedHints] of cases) for (const adapter of adapters) {
  for (const hintsFirst of [false, true]) {
    const tree = adapter.parseAndScope(source);
    const member = adapter.pickPath(tree, 'MemberExpression', path => path.node.property?.name === 'at')
      ?? adapter.pickPath(tree, 'OptionalMemberExpression', path => path.node.property?.name === 'at');
    checkTruthy(`${ label }/${ adapter.name }: receiver`, member);
    const resolver = adapter.makeResolver();
    const key = `${ label }/${ adapter.name }/${ hintsFirst ? 'hints-first' : 'type-first' }`;
    let type, hints;
    if (hintsFirst) {
      hints = resolver.resolvePropertyUnionHints(member);
      type = resolver.resolvePropertyObjectType(member);
    } else {
      type = resolver.resolvePropertyObjectType(member);
      hints = resolver.resolvePropertyUnionHints(member);
    }
    check(`${ key }: type`, type ? type.primitive ? type.type : type.constructor : null, family);
    check(`${ key }: hints`, hints ? [...hints].sort().join(',') : null, expectedHints);
    check(`${ key }: repeated type`, resolver.resolvePropertyObjectType(member), type);
    check(`${ key }: repeated hints`, resolver.resolvePropertyUnionHints(member) ? [...resolver.resolvePropertyUnionHints(member)].sort().join(',') : null, expectedHints);
  }
}

// Input Types carry their qualifiers through the join; a family hint cannot rebuild them.
for (const annotation of ['readonly string[]', 'unknown[]', '[string, string]', 'never[]', 'Array<string | number>']) {
  for (const adapter of adapters) {
    const tree = adapter.parseAndScope(`export function read(flag: boolean, left: ${ annotation }, right: ${ annotation }) {
      let value; if (flag) value = left; else value = right; return value.at(0);
    }`);
    const writes = adapter.collectPaths(tree, 'AssignmentExpression');
    const member = adapter.pickPath(tree, 'MemberExpression');
    const resolver = adapter.makeResolver();
    const input = resolver.resolveNodeType(writes[0].get('right'));
    const before = JSON.stringify(input);
    const result = resolver.resolvePropertyObjectType(member);
    checkTruthy(`${ adapter.name }/${ annotation }: an input Type`, input);
    checkDeep(`${ adapter.name }/${ annotation }: Type detail survives`, result, input);
    check(`${ adapter.name }/${ annotation }: input stays immutable`, JSON.stringify(input), before);
    check(`${ adapter.name }/${ annotation }: hint`, [...resolver.resolvePropertyUnionHints(member)].join(','), 'array');
  }
}

for (const adapter of adapters) {
  const source = 'export function read(flag: boolean) { let value: string | string[]; if (flag) value = "ab"; else value = "cd"; return value.at(0); }';
  for (const first of ['type', 'hints']) {
    const firstTree = adapter.parseAndScope(source);
    const firstMember = adapter.pickPath(firstTree, 'MemberExpression');
    const firstResolver = adapter.makeResolver();
    withReentrantQuestion(() => first === 'type'
      ? firstResolver.resolvePropertyObjectType(firstMember)
      : firstResolver.resolvePropertyUnionHints(firstMember), 'census');
    check(`${ adapter.name }/${ first }: re-entrant first query cannot finalize the type`,
      firstResolver.resolvePropertyObjectType(firstMember)?.type, 'string');
    check(`${ adapter.name }/${ first }: re-entrant first query cannot finalize hints`,
      [...firstResolver.resolvePropertyUnionHints(firstMember)].join(','), 'string');
  }
  // A conservative first answer is temporary too: a later complete census must be observed
  // before a hints query happens to replace the general type cache's fallback.
  for (const first of ['type', 'hints']) {
    const recoveryTree = adapter.parseAndScope(source);
    const recoveryMember = adapter.pickPath(recoveryTree, 'MemberExpression');
    const recoveryBinding = recoveryMember.scope.getBinding('value');
    const foreignTree = adapter.parseAndScope('function other() { let value; function later() { value = ["changed"]; } }');
    const foreignWrite = adapter.pickPath(foreignTree, 'AssignmentExpression');
    recoveryBinding.constantViolations.push(adapter.name === 'babel' ? foreignWrite : foreignWrite.get('left'));
    const recovery = adapter.makeResolver();
    if (first === 'hints') recovery.resolvePropertyUnionHints(recoveryMember);
    check(`${ adapter.name }/${ first }: incomplete census is conservative`, recovery.resolvePropertyObjectType(recoveryMember), null);
    recoveryBinding.constantViolations.pop();
    check(`${ adapter.name }/${ first }: completed census retries the type`, recovery.resolvePropertyObjectType(recoveryMember)?.type, 'string');
    check(`${ adapter.name }/${ first }: completed census agrees with hints`, [...recovery.resolvePropertyUnionHints(recoveryMember)].join(','), 'string');
  }
  const tree = adapter.parseAndScope(source);
  const member = adapter.pickPath(tree, 'MemberExpression');
  const writes = adapter.collectPaths(tree, 'AssignmentExpression');
  const resolver = adapter.makeResolver();
  let rightReads = 0;
  for (const write of writes) {
    const { right } = write.node;
    Object.defineProperty(write.node, 'right', { configurable: true, enumerable: true, get() {
      rightReads++; return right;
    } });
  }
  check(`${ adapter.name }: hints-first value`, [...resolver.resolvePropertyUnionHints(member)].join(','), 'string');
  checkTruthy(`${ adapter.name }: write counter is armed`, rightReads > 0);
  rightReads = 0;
  check(`${ adapter.name }: type projection`, resolver.resolvePropertyObjectType(member)?.type, 'string');
  resolver.resolvePropertyUnionHints(member);
  resolver.resolvePropertyObjectType(member);
  check(`${ adapter.name }: no second arm scan`, rightReads, 0);
  const reentrant = withReentrantQuestion(() => resolver.resolvePropertyUnionHints(member), 'census');
  check(`${ adapter.name }: re-entry cannot consume the precise memo`, [...reentrant].sort().join(','), 'array,string');
  check(`${ adapter.name }: the outer answer survives re-entry`, [...resolver.resolvePropertyUnionHints(member)].join(','), 'string');

  // A changed effective census on the same receiver invalidates the local proof.
  const binding = member.scope.getBinding('value');
  const other = adapter.parseAndScope('export function other() { let value; function later() { value = ["changed"]; } }');
  const extra = adapter.pickPath(other, 'AssignmentExpression');
  binding.constantViolations.push(adapter.name === 'babel' ? extra : extra.get('left'));
  check(`${ adapter.name }: changed census cannot reuse a narrow`, resolver.resolvePropertyObjectType(member), null);
  check(`${ adapter.name }: changed census keeps broad hints`, [...resolver.resolvePropertyUnionHints(member)].sort().join(','), 'array,string');
  binding.constantViolations.pop();
  resolver.reset({ currentTreeReferences: true });
  check(`${ adapter.name }: current-tree reset`, resolver.resolvePropertyObjectType(member)?.type, 'string');

  const secondTree = adapter.parseAndScope(source.replaceAll('"ab"', '["ab"]').replaceAll('"cd"', '["cd"]'));
  resolver.reset();
  check(`${ adapter.name }: the next file has its own value`, resolver.resolvePropertyObjectType(adapter.pickPath(secondTree, 'MemberExpression'))?.constructor, 'Array');

  // A cloned source node carries no local memo; a moved node must use its new scope.
  const original = member.get('object');
  const arrayMember = adapter.pickPath(secondTree, 'MemberExpression');
  const moved = Object.create(original);
  Object.defineProperties(moved, {
    scope: { value: arrayMember.scope },
    parentPath: { value: arrayMember },
  });
  check(`${ adapter.name }: moved read uses its new binding`, resolver.resolveNodeType(moved)?.constructor, 'Array');
  const clone = Object.create(original);
  Object.defineProperty(clone, 'node', { value: { ...original.node } });
  const stamped = adapter.makeResolver();
  const stamp = { primitive: true, type: 'number' };
  stamped.resolvedType.set(clone.node, stamp);
  checkDeep(`${ adapter.name }: original-value stamp wins`, stamped.resolveNodeType(clone), stamp);
  stamped.reset({ currentTreeReferences: true });
  check(`${ adapter.name }: reset drops the clone stamp`, stamped.resolveNodeType(clone)?.type, 'string');

  // Exhausting the path budget must not publish a narrower local answer or poison a later read.
  const nestedTree = adapter.parseAndScope(`export function deep(flag: boolean) {
    let value: string | string[]; if (flag) value = "ab"; else value = "cd";
    ${ '{'.repeat(70) } value.at(0); ${ '}'.repeat(70) }
    return value.at(0);
  }`);
  const nestedReads = adapter.collectPaths(nestedTree, 'MemberExpression');
  const bounded = adapter.makeResolver();
  check(`${ adapter.name }: a cut keeps the conservative hints`,
    [...bounded.resolvePropertyUnionHints(nestedReads[0])].sort().join(','), 'array,string');
  check(`${ adapter.name }: a cut does not poison the following read`,
    bounded.resolvePropertyObjectType(nestedReads[1])?.type, 'string');

  // A failed query releases both its in-progress guard and its memo slot. Precollected
  // references expose failures in the value build rather than in the earlier census.
  for (const hintsFirst of [false, true]) for (const referencesFirst of [false, true]) {
    const retryTree = adapter.parseAndScope(source);
    const retryMember = adapter.pickPath(retryTree, 'MemberExpression');
    const retryWrite = adapter.pickPath(retryTree, 'AssignmentExpression').node;
    const { right } = retryWrite;
    const retryResolver = adapter.makeResolver();
    if (referencesFirst) retryResolver.collectBindingReferences(retryMember.get('object'));
    let throws = true;
    Object.defineProperty(retryWrite, 'right', { configurable: true, enumerable: true, get() {
      if (throws) throw new Error('flow retry control');
      return right;
    } });
    let caught = false;
    try {
      if (hintsFirst) retryResolver.resolvePropertyUnionHints(retryMember);
      else retryResolver.resolvePropertyObjectType(retryMember);
    } catch (error) { caught = error.message === 'flow retry control'; }
    const key = `${ adapter.name }/${ hintsFirst }/${ referencesFirst }`;
    check(`${ key }: throwing control`, caught, true);
    throws = false;
    check(`${ key }: retry after throw`, retryResolver.resolvePropertyObjectType(retryMember)?.type, 'string');
    check(`${ key }: retry hints`, [...retryResolver.resolvePropertyUnionHints(retryMember)].join(','), 'string');
  }
}

for (const adapter of adapters) {
  const tree = adapter.parseAndScope('export function read(flag: boolean) { let value; value = flag ? "ab" : "cd"; return value.at(0); }');
  const member = adapter.pickPath(tree, 'MemberExpression');
  let questions = 0;
  let validContexts = true;
  const resolver = adapter.makeResolver({ getDecisionAdapter: () => ({
    decidedSelection(node, context) {
      questions++;
      validContexts &&= Boolean(context.path?.node && context.scope && context.path.scope === context.scope);
      return null;
    },
  }) });
  check(`${ adapter.name }: branching RHS type`, resolver.resolvePropertyObjectType(member)?.type, 'string');
  check(`${ adapter.name }: branching RHS hints`, [...resolver.resolvePropertyUnionHints(member)].join(','), 'string');
  checkTruthy(`${ adapter.name }: build decision is consulted`, questions > 0);
  check(`${ adapter.name }: build decision keeps path and scope`, validContexts, true);
}

for (const adapter of adapters) {
  const counts = [];
  for (const size of [32, 64, 128]) {
    const padding = 'void 0;'.repeat(size);
    const reads = 'value.at(0);'.repeat(size);
    const tree = adapter.parseAndScope(`export function read(flag: boolean) {
      let value; if (flag) { ${ padding } value = "ab"; } else { ${ padding } value = "cd"; } ${ reads }
    }`);
    const statements = adapter.collectPaths(tree, 'ExpressionStatement');
    const members = adapter.collectPaths(tree, 'MemberExpression');
    let count = 0;
    for (const statement of statements) {
      const { type } = statement.node;
      Object.defineProperty(statement.node, 'type', { configurable: true, enumerable: true, get() {
        count++; return type;
      } });
    }
    const resolver = adapter.makeResolver();
    for (const member of members) {
      check(`${ adapter.name }/${ size }: wide-join type`, resolver.resolvePropertyObjectType(member)?.type, 'string');
      check(`${ adapter.name }/${ size }: wide-join hints`, [...resolver.resolvePropertyUnionHints(member)].join(','), 'string');
    }
    checkTruthy(`${ adapter.name }/${ size }: statement counter is armed`, count > size);
    counts.push(count);
  }
  for (let index = 1; index < counts.length; index++) {
    checkTruthy(`${ adapter.name }: doubling read and branch width stays linear`, counts[index] <= counts[index - 1] * 2.4, counts.join(' -> '));
  }
}

finish();
