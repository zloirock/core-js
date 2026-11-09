// Package ownership is separate from extracting an already trusted entry subpath.
import {
  coreJSImportSubpath,
  isCoreJSFile,
  resolveImportPath,
} from '../../packages/core-js-polyfill-provider/helpers/path-normalize.js';
import {
  globalProxyNameFromImportSource,
  pureCtorNameFromImportSource,
  pureImportEntryOfProgram,
  pureImportSourceEntry,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { symbolKeyFromSource } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { scanExistingCoreJSImports } from '../../packages/core-js-polyfill-provider/detect-usage/entries.js';
import { ownOutputTests } from '../../packages/core-js-polyfill-provider/detect-usage/own-output.js';
import { createChecker } from './harness.mjs';

const { check, runBoth, finish } = createChecker('pure-import-sources');
const packages = ['my-pure', '@vendor/pure'];
const sourceTests = ownOutputTests({ pkg: 'my-pure', packages });

for (const source of [
  '@core-js/pure/actual/map/constructor',
  'core-js-pure/actual/map/constructor.js',
  'my-pure/actual/map/constructor/index.js?version=2',
  '/app/node_modules/@vendor/pure/actual/map/constructor.js#hash',
  'C:\\app\\node_modules\\my-pure\\actual\\map\\constructor.js',
  resolveImportPath('@core-js/pure', 'actual/map/constructor', true),
]) {
  check(`entry/${ source }`, pureImportSourceEntry(coreJSImportSubpath(source, packages)), 'map/constructor');
  check(`ctor/${ source }`, pureCtorNameFromImportSource(source, packages), 'Map');
  check(`own/${ source }`, sourceTests.isPureImportSource(source), true);
  runBoth(`binding/${ source }`, `import M from ${ JSON.stringify(source) };`, (adapter, prog, label) => {
    check(label, pureImportEntryOfProgram(prog.node, 'M', packages), 'map/constructor');
  });
}

for (const source of [
  './features/array', '../actual/map/constructor', './vendor/@core-js/pure/actual/map/constructor',
  'foreign/features/array', 'foreign/core-js-pure/actual/map/constructor',
  '/app/not-my-pure/actual/map/constructor', 'my-pure-extra/actual/map/constructor',
  'actual/map/constructor', '', null, 42,
]) {
  check(`foreign/${ source }`, coreJSImportSubpath(source, packages), null);
  check(`foreign ctor/${ source }`, pureCtorNameFromImportSource(source, packages), null);
  check(`foreign own/${ source }`, sourceTests.isPureImportSource(source), false);
}

check('extractor accepts a trusted short path', pureImportSourceEntry('stable/map/index.js?v=1'), 'map');
check('extractor is not a source predicate', pureImportSourceEntry('./features/array.js'), 'array');
for (const prefix of ['@core-js/pure', 'my-pure', '/app/node_modules/@vendor/pure']) {
  check(`proxy/${ prefix }`, globalProxyNameFromImportSource(`${ prefix }/actual/global-this/index.js?v=1`, packages), 'globalThis');
  check(`symbol/${ prefix }`, symbolKeyFromSource(`${ prefix }/actual/symbol/iterator/index.js#x`, packages), 'Symbol.iterator');
}
check('foreign proxy', globalProxyNameFromImportSource('./actual/global-this.js', packages), null);
check('foreign symbol', symbolKeyFromSource('./actual/symbol/iterator.js', packages), null);
check('unflavored symbol', symbolKeyFromSource('@core-js/pure/symbol/iterator', packages), 'Symbol.iterator');
check('unflavored proxy', globalProxyNameFromImportSource('@core-js/pure/global-this', packages), 'globalThis');
check('unflavored constructor', pureCtorNameFromImportSource('@core-js/pure/map/constructor', packages), 'Map');
for (const source of ['/app/core-js/tests/features/array.js', '/app/core-js/tests/features/list/get-list.js']) {
  check(`nested flavor is not pure/${ source }`, sourceTests.isPureImportSource(source), false);
}
check('nested symbol is not core-js', symbolKeyFromSource('/app/core-js/tests/symbol/iterator.js', packages), null);

for (const pkg of ['my-pure', '@vendor/pure', 'core-js']) {
  for (const tail of ['internals/check.js', 'modules/es.array.at.js', 'actual/array/index.js', 'index.js', 'configurator.js']) {
    check(`self/${ pkg }/${ tail }`, isCoreJSFile(`/app/node_modules/${ pkg }/${ tail }?x=1`, packages), true);
  }
  check(`self boundary/${ pkg }`, isCoreJSFile(`/app/node_modules/${ pkg }-user/internals/check.js`, packages), false);
  check(`self user file/${ pkg }`, isCoreJSFile(`/app/node_modules/${ pkg }/src/index.js`, packages), false);
}

for (const mode of ['es', 'stable', 'actual', 'full', 'features']) {
  for (const declaration of [
    `import C from 'my-pure/${ mode }/map/constructor.js';`,
    `const C = require('my-pure/${ mode }/map/constructor.js');`,
  ]) {
    runBoth(`flavor/${ declaration }`, declaration, (adapter, prog, label) => {
      const found = [];
      scanExistingCoreJSImports(prog.node, {
        packages, pkg: 'my-pure', mode: 'actual',
        adapter: { getStringValue: node => node?.value, isStringLiteral: node => typeof node?.value === 'string' },
        onPureImport: (entry, name, flavor) => found.push([entry, name, flavor]),
      });
      check(label, JSON.stringify(found), JSON.stringify([['map/constructor', 'C', mode]]));
    });
  }
}

for (const source of ['./vendor/my-pure/actual/map/constructor', 'foreign/my-pure/actual/map/constructor']) {
  runBoth(`foreign registry/${ source }`, `import C from '${ source }';`, (adapter, prog, label) => {
    const found = [];
    scanExistingCoreJSImports(prog.node, {
      packages, pkg: 'my-pure', mode: 'actual',
      adapter: { getStringValue: node => node?.value },
      onPureImport: (...entry) => found.push(entry),
    });
    check(label, found.length, 0);
  });
}

finish();
