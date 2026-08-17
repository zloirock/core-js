// The command line, for the three runners that have one. A filter the user typed and the runner did
// not apply is the worst outcome this boundary has: the run is GREEN over a fraction of what its
// output claims, and nothing says so.
//
// Three rules, none of them obvious from the call sites:
//   - absent is `=== undefined` and nothing else. `!filter` is true for '', 0, false and NaN, and any
//     of those turns filtering off entirely - past the "matched nothing" gate, which fires on an empty
//     result and never sees one
//   - minimist types its positionals, so a numeric-looking token arrives as a NUMBER and reaches
//     `path.isAbsolute`, which throws `ERR_INVALID_ARG_TYPE` before any message about filters
//   - a named key is not a positional. `--lib three` leaves `argv._` empty, so a gate that reads only
//     `argv._` has nothing to complain about while the runner covers the whole matrix
//
// No dependencies: the raw tier must not load a bundler to read its argument.

// zxi consumes `time`, `cd` and the script path off `argv._` as positionals before importing the
// script, so a named key reaching a runner is always unexpected, whichever runner it is. Nothing here
// accepts options, and the day one does is the day to take a list of them.
export function positionals(argv, { usage, names }) {
  const unexpected = Object.keys(argv).filter(key => key !== '_');
  if (unexpected.length) {
    throw new Error(`unexpected option(s): ${ unexpected.map(key => `--${ key }`).join(' ') } - ${ usage }`);
  }
  // to strings on the way in, so everything downstream compares against one type
  const given = argv._.map(value => String(value));
  if (given.length > names.length) {
    throw new Error(`unexpected argument(s): ${ given.slice(names.length).join(' ') } - ${ usage }`
      + ` (takes ${ names.join(', ') })`);
  }
  // a slot the user did not fill stays `undefined`, which is what "no filter" means everywhere below
  return names.map((_, index) => given[index]);
}
