process.env.TIMING = true;

await $`eslint --concurrency=auto --config ./tests/eslint/eslint.config.js ./ --fix=${ !!process.env.FIX }`;
