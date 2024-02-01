if (process.env.CI) await $`playwright install --with-deps chromium firefox webkit`;
else await $`playwright install chromium firefox webkit`;

$.quote = it => `'${ it }'`;

await Promise.all([
  ['packages/core-js-bundle/index', 'tests/bundles/unit-global'],
  ['packages/core-js-bundle/minified', 'tests/bundles/unit-global'],
  // ['tests/bundles/unit-pure'],
].map(files => $`karma start -f=${ files.map(file => `../../${ file }.js`).join(',') }`));
