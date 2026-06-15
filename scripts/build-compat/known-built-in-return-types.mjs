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

// normalize shorthand string hints ('Array', 'string') to { type: 'Array' }, { type: 'string' }
// 'element' and 'inherit' are resolution directives, not types — left as strings
function normalizeHint(hint) {
  if (typeof hint === 'string') {
    if (hint === 'element' || hint === 'inherit') return hint;
    return { type: hint };
  }
  const result = { type: hint.type };
  if (hint.element !== undefined) result.element = normalizeHint(hint.element);
  if (hint.resolved !== undefined) result.resolved = normalizeHint(hint.resolved);
  // mutatesArgument: list of zero-based arg indices a static method mutates in place
  // (e.g. Object.assign -> [0] target). passed through unchanged - no inner hint
  if (hint.mutatesArgument !== undefined) result.mutatesArgument = hint.mutatesArgument;
  // returnsArgument: zero-based index of the argument a method returns unchanged (ECMAScript
  // identity, e.g. Object.freeze -> 0). lets the resolver keep the argument's concrete type
  // instead of the declared `type`. passed through unchanged - no inner hint
  if (hint.returnsArgument !== undefined) result.returnsArgument = hint.returnsArgument;
  return result;
}

function normalizeFlat(table) {
  return Object.fromEntries(Object.entries(table).map(([key, hint]) => [key, normalizeHint(hint)]));
}

function normalizeNested(table) {
  return Object.fromEntries(Object.entries(table).map(([key, members]) => [key, normalizeFlat(members)]));
}

function normalizeConstructorHint(type, element) {
  if (type === null) return { type: null };
  const hint = { type };
  if (element !== undefined) hint.element = normalizeHint(element);
  return hint;
}

function normalizeConstructors(table) {
  return Object.fromEntries(Object.entries(table).map(([name, entry]) => {
    if (typeof entry === 'string') {
      const hint = { type: entry };
      return [name, { new: hint, call: hint }];
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

await fs.writeJson('packages/core-js-compat/known-built-in-return-types.json', {
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
}, { spaces: '  ' });

echo(chalk.green('known-built-in-return-types rebuilt'));
