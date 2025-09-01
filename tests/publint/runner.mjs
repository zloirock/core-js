const pkgs = await glob('packages/*/package.json');

await Promise.all(pkgs.map(async pkg => {
  return $`publint ${ pkg.slice(0, -13) }`;
}));
