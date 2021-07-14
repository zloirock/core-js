import entries from '@core-js/compat/entries';

const core = Object.entries(Object.keys(entries).reduce((accumulator, it) => {
  const entry = it.replace(/^core-js(\/)?/, './');
  // eslint-disable-next-line unicorn/no-unsafe-regex -- safe
  const match = entry.match(/^(\.\/(?:es|stable|actual|full|web)(?:\/[\w-]+)?)/);
  if (match) {
    const [, scope] = match;
    if (entry === scope) {
      const exists = fs.pathExistsSync(new URL(`../packages/${ it }.js`, import.meta.url));
      accumulator[entry] = `${ entry }${ exists ? '' : '/index' }.js`;
    } else {
      accumulator[`${ scope }/*`] = `${ scope }/*.js`;
    }
  } return accumulator;
}, {
  '.': './index.js',
  './configurator': './configurator.js',
  './internals/*': './internals/*.js',
  './modules/*': './modules/*.js',
  './proposals': './proposals/index.js',
  './proposals/*': './proposals/*.js',
  './stage': './stage/index.js',
  './stage/*': './stage/*.js',
})).reduce((accumulator, [key, value]) => {
  accumulator[key] = value;
  accumulator[`./commonjs${ key.slice(1) }`] = `./commonjs${ value.slice(1) }`;
  return accumulator;
}, {
  './package': './package.json',
  './postinstall': './postinstall.js',
});

async function writeExportsField(path, exports) {
  const pkg = await fs.readJson(path);
  pkg.exports = exports;
  await fs.writeJson(path, pkg, { spaces: '  ' });
}

(async function () {
  await writeExportsField('./packages/core-js/package.json', {
    ...core,
    './bundle': './bundle/full.js',
    './bundle/actual': './bundle/actual.js',
    './bundle/full': './bundle/full.js',
  });
  await writeExportsField('./packages/core-js-pure/package.json', core);
  // eslint-disable-next-line no-console -- output
  console.log(chalk.green('`exports` fields updated'));
})();
