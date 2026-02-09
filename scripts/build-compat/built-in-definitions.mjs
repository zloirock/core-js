import {
  Globals,
  StaticProperties,
  InstanceProperties,
} from '../../packages/core-js-compat/src/built-in-definitions.mjs';

const entries = new Set(Object.keys(await fs.readJson('packages/core-js-compat/entries.json')));

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

function unfoldMode(data, kind) {
  if (!data) return;
  if (kind !== 'instance') return unfoldHint(data);
  const result = dict();
  if (Object.hasOwn(data, 'common')) for (const [key, value] of Object.entries(data)) {
    if (value) result[key] = unfoldHint(value);
  } else result.common = unfoldHint(data);
  return result;
}

function unfoldEntry(data, kind) {
  if (!data) return;
  const result = dict();
  const { global, pure } = data;
  if (global || pure) {
    result.global = unfoldMode(global, kind);
    result.pure = unfoldMode(pure, kind);
  } else {
    result.global = result.pure = unfoldMode(data, kind);
  }
  return result;
}

function unfoldKind(data, kind) {
  const result = dict();
  for (const [key, value] of Object.entries(data)) {
    if (value) result[key] = unfoldEntry(value, kind);
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
