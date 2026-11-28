// Where this suite keeps things. No dependencies, so the raw tier can ask without loading a bundler.
import { isAbsolute, join, relative } from 'node:path';

export const HERE = import.meta.dirname;
export const ROOT = join(HERE, '..', '..');
export const PACKAGE_JSON = join(HERE, 'package.json');
export const ARTIFACTS = join(HERE, 'artifacts');
export const SNAPSHOTS = join(HERE, 'snapshots');
export const NODE_MODULES = join(HERE, 'node_modules');

const CHECKER = toPosix(join(HERE, 'exercises', 'checks.mjs'));

export function isExerciseChecker(id) {
  return typeof id === 'string' && toPosix(id) === CHECKER;
}

const PACKAGE = /^(?:core-js(?:-pure)?|@core-js\/[^/]+)\//;

export function isCoreJsModule(id) {
  const path = toPosix(id.replace(/^\0/, ''));
  const local = toPosix(relative(ROOT, path));
  // Outside the workspace the installed package's absolute path still identifies its owner.
  const file = local.startsWith('../') || isAbsolute(local) ? path : `/${ local }`;
  const nested = file.lastIndexOf('/node_modules/');
  if (nested !== -1) {
    return PACKAGE.test(file.slice(nested + '/node_modules/'.length));
  }
  return local.startsWith('packages/') && PACKAGE.test(local.slice('packages/'.length));
}

// ids arrive from several plugins and from rollup; on windows one already-normalized id makes a
// `startsWith` answer `false` in silence, and then every intra-package import resolves to nothing
export function toPosix(filePath) {
  return filePath.replaceAll('\\', '/');
}
