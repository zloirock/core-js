const { access, readdir } = fs;

const pkgs = await readdir('packages');

await Promise.all(pkgs.map(async pkg => {
  // eslint-disable-next-line promise/prefer-await-to-then -- ok
  if (await access(`./packages/${ pkg }/package.json`).then(() => true, () => false)) {
    return $`publint packages/${ pkg }`;
  }
}));
