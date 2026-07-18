if (process.env.CI) await $`playwright install --with-deps chromium firefox webkit`;
else await $`playwright install chromium firefox webkit`;

$.quote = it => `'${ it }'`;

await Promise.all([
  ['packages/core-js-bundle/index', 'tests/bundles/unit-global'],
  ['packages/core-js-bundle/minified', 'tests/bundles/unit-global'],
  ['tests/bundles/unit-pure'],
  ['tests/bundles/e2e-usage-pure-babel'],
  // the unplugin pre+post e2e leg (the `-pre` / `-post` legs stay node-only to bound browser time)
  ['tests/bundles/e2e-usage-pure-unplugin-pre-post'],
].map(files => $`karma start -f=${ files.map(file => `../../${ file }.js`).join(',') }`));
