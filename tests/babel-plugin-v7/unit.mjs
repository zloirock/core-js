// thin shim: zxi installs this workspace's deps (giving us @babel/core@7) and cd's
// here before importing this file. delegating to the shared unit orchestrator keeps the
// suite list in one place; BABEL_REQUIRE_FROM picks the workspace whose `@babel/parser`,
// `@babel/traverse`, `@babel/types` the unit suite imports via createRequire. set here so
// the npm script doesn't rely on POSIX `VAR=value cmd` inline syntax (cmd.exe rejects it)
process.env.BABEL_REQUIRE_FROM ??= '../babel-plugin-v7';
await import('../babel-plugin/unit.mjs');
