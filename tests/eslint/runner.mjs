process.env.ESLINT_USE_FLAT_CONFIG = true;

const TIMING = 0;

await $`TIMING=${ TIMING } eslint --config ./tests/eslint/eslint.config.js ./`;
