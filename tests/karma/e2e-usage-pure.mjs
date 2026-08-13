import { start } from './helpers.mjs';

for (const files of [
  ['tests/bundles/e2e-usage-pure-babel'],
  // the unplugin pre+post e2e leg (the `-pre` / `-post` legs stay node-only to bound browser time)
  ['tests/bundles/e2e-usage-pure-unplugin-pre-post'],
]) await start(files);
