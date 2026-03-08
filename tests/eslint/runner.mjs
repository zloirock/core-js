process.env.ESLINT_USE_FLAT_CONFIG = true;

await $`TIMING=1 eslint --concurrency=auto --config ./tests/eslint/eslint.config.js ./`;
