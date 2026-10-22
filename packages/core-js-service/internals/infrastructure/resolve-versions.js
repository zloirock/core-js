import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { normalizeCoreJSVersion } from '@core-js/compat/helpers';

const require = createRequire(import.meta.url);

// every version that decides the bytes goes into the name of every bundle - core-js, compat and the
// builder. one read wrong is a name that stops changing when it should, on an `immutable` address
export default function resolveVersions(version) {
  return {
    coreJS: String(normalizeCoreJSVersion(version)),
    // neither package exports its own manifest, so each is read beside an entry point it does export
    compat: manifest('@core-js/compat/compat'),
    builder: manifest('@core-js/builder'),
  };
}

function manifest(entry) {
  // eslint-disable-next-line import/no-dynamic-require -- the manifest is found beside the entry
  return require(join(dirname(require.resolve(entry)), 'package.json')).version;
}
