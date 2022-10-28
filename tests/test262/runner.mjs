cd('tests/test262');

await $`npm i --no-audit --no-fund --loglevel=error`;

await $`npx test262-harness \
  --threads=${ os.cpus().length } \
  --host-args="--unhandled-rejections=none" \
  --preprocessor=preprocessor.js \
  --prelude=../../packages/core-js-bundle/index.js \
  --test262-dir=node_modules/test262 \
  node_modules/test262/test/built-ins/**/*.js \
`;
