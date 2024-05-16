const featuresExclude = [
  'arraybuffer-transfer',
  'regexp-duplicate-named-groups',
  'regexp-modifiers',
  'regexp-v-flag',
  'resizable-arraybuffer',
];

await $`test262-harness \
  --features-exclude=${ featuresExclude.join(',') } \
  --threads=${ os.cpus().length } \
  --host-args="--unhandled-rejections=none" \
  --preprocessor=preprocessor.js \
  --prelude=../../packages/core-js-bundle/index.js \
  --test262-dir=node_modules/test262 \
  node_modules/test262/test/built-ins/**/*.js \
`;
