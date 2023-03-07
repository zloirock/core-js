// compat
await Promise.all(
  ["compat-data.js", "tests.js"].map((file) =>
    fs.copy(`tests/compat/${file}`, `docs/.vuepress/public/compat/${file}`)
  )
);
echo(chalk.green("compat data copied"));

// Changelog
fs.copy(`CHANGELOG.md`, `docs/about/changelog.md`);
echo(chalk.green("changelog copied"));
