'use strict';
const { copyFile, lstat, mkdir, readdir, rm, unlink } = require('fs').promises;

let copied = 0;

async function copy(from, to, { force = false } = {}) {
  const source = await lstat(from);
  const exist = !!await lstat(to).catch(() => false);

  if (source.isDirectory()) {
    if (!exist) await mkdir(to);
    const entries = await readdir(from);
    await Promise.all(entries.map(entry => copy(`${ from }/${ entry }`, `${ to }/${ entry }`, { force })));
  } else {
    if (exist) {
      if (!force) return;
      await unlink(to);
    }
    await copyFile(from, to);
    copied++;
  }
}

(async () => {
  // it's available only from Node 14.14, but this step required only for development where we use modern Node
  if (rm) {
    await Promise.all((await readdir('./packages/core-js-pure'))
      .filter(entry => !['override', '.npmignore', 'package.json', 'README.md'].includes(entry))
      .map(entry => rm(`./packages/core-js-pure/${ entry }`, { force: true, recursive: true })));

    await rm('./tests/bundles', { force: true, recursive: true });

    // eslint-disable-next-line no-console -- output
    console.log('\u001B[32mold copies removed\u001B[0m');
  }

  for (const pkg of await readdir('./packages')) {
    await copy('./LICENSE', `./packages/${ pkg }/LICENSE`, { force: true });
  }

  await copy('./packages/core-js', './packages/core-js-pure');
  await copy('./packages/core-js-pure/override', './packages/core-js-pure', { force: true });
  await copy('./packages/core-js/postinstall.js', './packages/core-js-bundle/postinstall.js', { force: true });

  // eslint-disable-next-line no-console -- output
  console.log(`\u001B[32mcopied \u001B[36m${ copied } \u001B[32mfiles\u001B[0m`);
})();
