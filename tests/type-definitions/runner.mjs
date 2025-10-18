await $`tsc`;

// await $`npx -p typescript@5.5 tsc -p proposals/global/tsconfig.esnext.json`;

await $`tsc -p proposals/global/tsconfig.esnext.json`;
await $`tsc -p proposals/global/tsconfig.es2023.json`;
await $`tsc -p proposals/global/tsconfig.es6.json`;

await $`tsc -p proposals/pure/tsconfig.esnext.json`;
await $`tsc -p proposals/pure/tsconfig.es2023.json`;
await $`tsc -p proposals/pure/tsconfig.es6.json`;

