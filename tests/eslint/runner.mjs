process.env.ESLINT_USE_FLAT_CONFIG = true;

await $`TIMING=1 eslint --config ./tests/eslint/eslint.config.js ./`;
