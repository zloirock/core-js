const pkgs = await fs.readdir('packages');

await Promise.all(pkgs.map(pkg => $`publint packages/${ pkg }`));
