await Promise.all([
  ['unit-global/index', 'unit-global'],
  ['unit-pure/index', 'unit-pure'],
].map(([entry, output]) => $`webpack \
  --entry ../../tests/${ entry }.js \
  --output-filename ${ output }.js \
`));
