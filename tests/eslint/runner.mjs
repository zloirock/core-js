const dir = path.dirname(import.meta.url).slice(7);

process.env.ESLINT_USE_FLAT_CONFIG = true;

await $`eslint --config ${ dir }/eslint.config.js ./`;
