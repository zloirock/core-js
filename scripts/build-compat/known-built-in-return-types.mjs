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
  return result;
}

function normalizeFlat(table) {
  const result = {};
  for (const [key, hint] of Object.entries(table)) result[key] = normalizeHint(hint);
  return result;
}

function normalizeNested(table) {
  const result = {};
  for (const [key, members] of Object.entries(table)) result[key] = normalizeFlat(members);
  return result;
}

function normalizeConstructorHint(type, element) {
  if (type === null) return { type: null };
  const hint = { type };
  if (element !== undefined) hint.element = normalizeHint(element);
  return hint;
}

function normalizeConstructors(table) {
  const result = {};
  for (const [name, entry] of Object.entries(table)) {
    if (typeof entry === 'string') {
      const hint = { type: entry };
      result[name] = { new: hint, call: hint };
    } else {
      const { element } = entry;
      const newType = entry.new ?? null;
      const callType = 'call' in entry ? entry.call : newType;
      result[name] = {
        new: normalizeConstructorHint(newType, element),
        call: normalizeConstructorHint(callType, element),
      };
    }
  }
  return result;
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
