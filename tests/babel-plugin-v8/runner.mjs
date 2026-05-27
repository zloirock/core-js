// thin shim: zxi installs this workspace's deps (giving us @babel/core@8.0.0-rc + matching
// transform plugins) and cd's here before importing this file. delegating to the shared
// runner keeps the fixture-suite logic in one place; the env vars below configure that
// runner to resolve babel + skip-list from THIS workspace. set here (rather than in
// package.json) so the cross-platform npm script doesn't rely on POSIX `VAR=value cmd`
// inline syntax which cmd.exe rejects
process.env.BABEL_REQUIRE_FROM ??= '../babel-plugin-v8';
process.env.BABEL_SKIP ??= '../babel-plugin-v8/skip.mjs';
process.env.BABEL_VARIANT ??= 'babel-v8';
await import('../babel-plugin/index.mjs');
