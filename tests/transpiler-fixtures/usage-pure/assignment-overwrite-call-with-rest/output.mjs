import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A call receiver with surviving rest reads cannot be repeated by an overwrite.
let method, rest;
({
  [(effect(), _Symbol$iterator)]: method = fallback(),
  ...rest
} = getReceiver());