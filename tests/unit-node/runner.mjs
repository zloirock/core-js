await Promise.all([
  ['packages/core-js/full/index', 'tests/bundles/unit-global'],
  ['packages/core-js/full/index', 'packages/core-js-bundle/index', 'tests/bundles/unit-global'],
  ['tests/bundles/unit-pure'],
  ['tests/bundles/e2e-usage-pure-babel'],
  ['tests/bundles/e2e-usage-pure-unplugin-pre'],
  ['tests/bundles/e2e-usage-pure-unplugin-pre-post'],
  ['tests/bundles/e2e-usage-pure-unplugin-post'],
].map(files => $`qunit ${ files.map(file => `${ file }.js`) }`).concat(
  // the stripped-realm legs COMPLEMENT the full-env qunit runs of the same bundles above
  // (both environments matter - full-env stays the primary): the same prebuilt bundle inside
  // a vm realm with the strip-manifest builtins deleted proves every ponyfill stands alone
  // and nothing silently reaches a native. the unplugin `-pre` and `-post` legs run full-env
  // ONLY - each side of the babel sandwich is architecturally blind to what the other side
  // introduces, and in the stripped realm that blindness fails wholesale by design:
  //   `-pre` completes before babel, so babel-HELPER natives (Symbol.iterator / Array.from /
  //   Promise inside `_createForOfIteratorHelper` and friends) stay raw - sibling-generated
  //   helpers are out of the pure contract;
  //   `-post` detects on the fully-lowered text, so value-add folds needing pre-lowering
  //   shapes (typed dispatch, class-field containers, proxy-hop collapse, async plumbing)
  //   stay native-faithful raw reads;
  // single-pass stripped coverage lives in the transpiler-differential worker
  $`node tests/unit-node/stripped-realm.mjs e2e-usage-pure-babel`,
  $`node tests/unit-node/stripped-realm.mjs e2e-usage-pure-unplugin-pre-post`,
  $`node tests/unit-node/stripped-realm.mjs unit-pure`,
));
