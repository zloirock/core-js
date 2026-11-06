const pkgs = await glob('packages/*/package.json');

await Promise.all(pkgs.map(async pkg => {
  return $`publint --strict --level warning ${ pkg.slice(0, -13) }`;
}));
