process.env.ESLINT_USE_FLAT_CONFIG = true;

await $`TIMING=1 eslint --concurrency=auto --fix --config ./tests/eslint/eslint.config.js ./`;
