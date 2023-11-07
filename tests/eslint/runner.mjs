process.env.ESLINT_USE_FLAT_CONFIG = true;

await $`eslint --config ./tests/eslint/eslint.config.js ./`;
