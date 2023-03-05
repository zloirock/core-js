await Promise.all(
  ["browsers-runner.js", "compat-data.js", "tests.js"].map((file) =>
    fs.copy(`tests/compat/${file}`, `docs/.vuepress/public/compat/${file}`)
  )
);

echo(chalk.green("compat data copied"));
