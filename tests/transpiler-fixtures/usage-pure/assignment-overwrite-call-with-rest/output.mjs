import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// An instance read beside object rest retains its native source and exclusions.
// The receiver call and computed key run once; rest, not call repeatability, prevents overwrite.
let method, rest;
({
  [(effect(), _Symbol$iterator)]: method = fallback(),
  ...rest
} = getReceiver());