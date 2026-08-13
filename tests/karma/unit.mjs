import { start } from './helpers.mjs';

for (const files of [
  ['packages/core-js-bundle/index', 'tests/bundles/unit-global'],
  ['packages/core-js-bundle/minified', 'tests/bundles/unit-global'],
  ['tests/bundles/unit-pure'],
]) await start(files);
