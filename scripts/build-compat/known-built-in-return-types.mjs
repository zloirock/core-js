import {
  globalMethods,
  globalProperties,
  instanceMethods,
  instanceProperties,
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

await fs.writeJson('packages/core-js-compat/known-built-in-return-types.json', {
  globalMethods: normalizeFlat(globalMethods),
  globalProperties: normalizeFlat(globalProperties),
  staticMethods: normalizeNested(staticMethods),
  staticProperties: normalizeNested(staticProperties),
  instanceMethods: normalizeNested(instanceMethods),
  instanceProperties: normalizeNested(instanceProperties),
  staticTypeGuards: normalizeNested(staticTypeGuards),
}, { spaces: '  ' });

echo(chalk.green('known-built-in-return-types rebuilt'));
