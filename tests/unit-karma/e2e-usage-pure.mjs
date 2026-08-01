// run the PREBUILT e2e-usage-pure bundles in real browsers (Playwright Chromium / Firefox /
// WebKit): the WINDOW_PRESENT branches of the probe-nav tests only execute here
if (process.env.CI) await $`playwright install --with-deps chromium firefox webkit`;
else await $`playwright install chromium firefox webkit`;

$.quote = it => `'${ it }'`;

await Promise.all([
  ['tests/bundles/e2e-usage-pure-babel'],
  // the unplugin pre+post e2e leg (the `-pre` / `-post` legs stay node-only to bound browser time)
  ['tests/bundles/e2e-usage-pure-unplugin-pre-post'],
].map(files => $`karma start -f=${ files.map(file => `../../${ file }.js`).join(',') }`));
