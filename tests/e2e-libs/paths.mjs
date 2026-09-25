// Where this suite keeps things. No dependencies, so the raw tier can ask without loading a bundler.
import { join } from 'node:path';

export const HERE = import.meta.dirname;
export const ROOT = join(HERE, '..', '..');
export const PACKAGE_JSON = join(HERE, 'package.json');
export const ARTIFACTS = join(HERE, 'artifacts');
export const SNAPSHOTS = join(HERE, 'snapshots');
export const NODE_MODULES = join(HERE, 'node_modules');

// the trailing separator is load-bearing: without it `core-js` matches inside `core-js-builder`.
const CORE_JS_MODULE = /[/\\](?:node_modules|packages)[/\\](?:core-js(?:-pure)?|@core-js[/\\][^/\\]+)[/\\]/;

export function isCoreJsModule(id) {
  return CORE_JS_MODULE.test(id);
}

// ids arrive from several plugins and from rollup; on windows one already-normalized id makes a
// `startsWith` answer `false` in silence, and then every intra-package import resolves to nothing
export function toPosix(filePath) {
  return filePath.replaceAll('\\', '/');
}
