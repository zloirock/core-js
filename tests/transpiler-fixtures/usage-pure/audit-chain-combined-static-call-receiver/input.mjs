// chain-combine receiver that is itself a polyfilled static call (`Array.from(...)`): the static
// must resolve to its pure binding (`_Array$from`) inside the memoized receiver, not stay raw.
// keeping the receiver subtree visitable lets the static rewrite reach it
Array.from(src).flat?.().at(0);
