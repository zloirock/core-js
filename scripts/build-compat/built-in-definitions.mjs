import {
  Globals,
  StaticProperties,
  InstanceProperties,
} from '../../packages/core-js-compat/src/built-in-definitions.mjs';

const entries = new Set(Object.keys(await fs.readJson('packages/core-js-compat/entries.json')));

const TYPE_HINTS = new Set([
  'common',
  'array',
  'bigint',
  'boolean',
  'date',
  'function',
  'iterator',
  'number',
  'object',
  'promise',
  'regexp',
  'string',
  'symbol',
]);

function dict() {
  return Object.create(null);
}

function unfoldDependencies(data) {
  if (!data) return;
  const dependencies = typeof data == 'string' ? [data] : data;
  for (const entry of dependencies) if (!entries.has(`full/${ entry }`)) {
    throw new Error(`incorrect dependency: ${ entry }`);
  }
  return dependencies;
}

function unfoldHint(data) {
  if (!data) return;
  const result = dict();
  const { dependencies, filters } = data;
  if (dependencies || filters) {
    if (dependencies) result.dependencies = unfoldDependencies(dependencies);
    if (filters) result.filters = filters;
  } else result.dependencies = unfoldDependencies(data);
  return result;
}

function unfoldMode(data, kind, modeName, entryName) {
  if (!data) return;
  if (kind !== 'instance') return unfoldHint(data);
  const result = dict();
  if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).some(key => TYPE_HINTS.has(key))) {
    if (!Object.hasOwn(data, 'common')) {
      const nonCommonHintKeys = Object.keys(data).filter(key => TYPE_HINTS.has(key));
      if (nonCommonHintKeys.length > 1) {
        if (modeName === 'pure' || modeName === 'shared') {
          throw new Error(`${ entryName }: pure instance properties with multiple type hints require 'common'`);
        }
        for (const key of nonCommonHintKeys) {
          const value = data[key];
          if (value && typeof value === 'object' && !Array.isArray(value) && value.filters) {
            throw new Error(`${ entryName }: instance properties with type hints with filters require 'common'`);
          }
        }
      }
    }
    for (const [key, value] of Object.entries(data)) {
      if (value) result[key] = unfoldHint(value);
    }
  } else result.common = unfoldHint(data);
  return result;
}

function unfoldEntry(data, kind, entryName) {
  if (!data) return;
  const result = dict();
  const { global, pure } = data;
  if (global || pure) {
    result.global = unfoldMode(global, kind, 'global', entryName);
    result.pure = unfoldMode(pure, kind, 'pure', entryName);
  } else {
    result.global = result.pure = unfoldMode(data, kind, 'shared', entryName);
  }
  return result;
}

function unfoldKind(data, kind) {
  const result = dict();
  for (const [key, value] of Object.entries(data)) {
    if (value) result[key] = unfoldEntry(value, kind, key);
  }
  return result;
}

const $Globals = unfoldKind(Globals, 'global');

const $StaticProperties = Object.entries(StaticProperties).reduce((memo, [key, value]) => {
  memo[key] = unfoldKind(value, 'static');
  return memo;
}, dict());

const $InstanceProperties = unfoldKind(InstanceProperties, 'instance');

await fs.writeJson('packages/core-js-compat/built-in-definitions.json', {
  Globals: $Globals,
  StaticProperties: $StaticProperties,
  InstanceProperties: $InstanceProperties,
}, { spaces: '  ' });

echo(chalk.green('built-in-definitions rebuilt'));
