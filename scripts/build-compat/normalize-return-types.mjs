// The normalizer behind `known-built-in-return-types.json`: shorthand string hints become objects,
// resolution directives stay strings, and every other key is refused. Plain ESM rather than a zx
// script (`prepare-monorepo.mjs` is the other one) because it is the only writer of a contract two
// packages read, and a writer nothing can call in a test is a writer nothing checks - the refusals
// below are locked in `tests/compat-tools/known-built-in-return-types.mjs`.
import {
  constructors,
  globalMethods,
  globalProperties,
  globalProxies,
  instanceMethods,
  instanceProperties,
  namespaces,
  staticMethods,
  staticProperties,
  staticTypeGuards,
} from '../../packages/core-js-compat/src/known-built-in-return-types.mjs';
// the hint grammar belongs to the resolver that decodes it, not to the registry that carries the
// hints - so the one place that declares it is the provider, and this normalizer reads it there
import { RESOLUTION_DIRECTIVES } from '../../packages/core-js-polyfill-provider/resolve-node-type/base.js';

const { hasOwn } = Object;

// the qualifiers a hint may carry beside its `type`, each with its own treatment below. an
// unknown key is a REFUSAL, not a drop, the same way `built-in-definitions` refuses one: this
// normalizer is the only writer of the generated artifact, so a key it does not handle
// disappears before the schema gate ever sees it - a typo (`mutatesArgumnt`) silently loses the
// annotation it was meant to declare
const VALID_HINT_KEYS = new Set(['type', 'element', 'resolved', 'mutatesArgument', 'mutatesElements', 'nullable']);

// the constructor table takes its own keys, so it needs its own refusal: `call` absent means
// "same as `new`", which makes a typo there silently FLIP the callee type rather than merely
// drop it - `Boolean` mistyped as `cll` resolves `Boolean(x)` to the object, not the primitive
const VALID_CONSTRUCTOR_KEYS = new Set(['new', 'call', 'element']);

// normalize shorthand string hints ('Array', 'string') to { type: 'Array' }, { type: 'string' }
// the resolution DIRECTIVES are not types and stay strings
export function normalizeHint(hint) {
  // a list is a union of member hints, each normalized on its own
  if (Array.isArray(hint)) return hint.map(normalizeHint);
  if (typeof hint === 'string') {
    if (hasOwn(RESOLUTION_DIRECTIVES, hint)) return hint;
    return { type: hint };
  }
  for (const key of Object.keys(hint)) {
    if (!VALID_HINT_KEYS.has(key)) throw new Error(`unknown hint key: '${ key }'`);
  }
  const result = { type: hint.type };
  if (hint.element !== undefined) result.element = normalizeHint(hint.element);
  if (hint.resolved !== undefined) result.resolved = normalizeHint(hint.resolved);
  // mutatesArgument: list of zero-based arg indices a static method mutates in place
  // (e.g. Object.assign -> [0] target). passed through unchanged - no inner hint
  if (hint.mutatesArgument !== undefined) result.mutatesArgument = hint.mutatesArgument;
  // mutatesElements: an instance method that writes the receiver's elements in place
  // (`push` / `fill` / `sort` / TypedArray `set` / ...). the resolver invalidates
  // element-type precision across such calls. passed through unchanged - no inner hint
  if (hint.mutatesElements !== undefined) result.mutatesElements = hint.mutatesElements;
  // nullable: the spec return admits undefined / null (`find` / `at` / `pop` / `exec` / ...);
  // the resolver marks the decoded type so the logical truthy-fold keeps the operand union
  if (hint.nullable !== undefined) result.nullable = hint.nullable;
  return result;
}

export function normalizeFlat(table) {
  return Object.fromEntries(Object.entries(table).map(([key, hint]) => [key, normalizeHint(hint)]));
}

export function normalizeNested(table) {
  return Object.fromEntries(Object.entries(table).map(([key, members]) => [key, normalizeFlat(members)]));
}

function normalizeConstructorHint(type, element) {
  if (type === null) return { type: null };
  const hint = { type };
  if (element !== undefined) hint.element = normalizeHint(element);
  return hint;
}

export function normalizeConstructors(table) {
  return Object.fromEntries(Object.entries(table).map(([name, entry]) => {
    if (typeof entry === 'string') {
      const hint = { type: entry };
      return [name, { new: hint, call: hint }];
    }
    for (const key of Object.keys(entry)) {
      if (!VALID_CONSTRUCTOR_KEYS.has(key)) throw new Error(`unknown constructor key: '${ key }'`);
    }
    const { element } = entry;
    const newType = entry.new ?? null;
    const callType = 'call' in entry ? entry.call : newType;
    return [name, {
      new: normalizeConstructorHint(newType, element),
      call: normalizeConstructorHint(callType, element),
    }];
  }));
}

// the artifact, built. the writer next door only writes what this returns, so the schema gate can
// call it too and compare - which is the one way to notice that the generated file is older than
// the source it came from. spelled in the writer instead, that comparison would be a restatement
// of this shape and would drift from it.
export function buildReturnTypesArtifact() {
  return {
    globalMethods: normalizeFlat(globalMethods),
    globalProperties: normalizeFlat(globalProperties),
    staticMethods: normalizeNested(staticMethods),
    staticProperties: normalizeNested(staticProperties),
    instanceMethods: normalizeNested(instanceMethods),
    instanceProperties: normalizeNested(instanceProperties),
    staticTypeGuards: normalizeNested(staticTypeGuards),
    globalProxies,
    namespaces,
    constructors: normalizeConstructors(constructors),
  };
}
