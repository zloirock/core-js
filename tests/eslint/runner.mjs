process.env.TIMING = true;

const { FIX } = process.env;
const CACHE_PATH = './tests/eslint/node_modules/.cache/eslint';
const CONCURRENCY = !await fs.pathExists(CACHE_PATH);

await $`eslint \
  --concurrency=${ CONCURRENCY ? 'auto' : 'off' } \
  --cache \
  --cache-strategy content \
  --cache-location: ${ CACHE_PATH } \
  --config ./tests/eslint/eslint.config.js ./ \
  --fix=${ !!FIX } \
`;
