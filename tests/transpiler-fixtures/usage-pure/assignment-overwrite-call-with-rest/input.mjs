// A call receiver with surviving rest reads cannot be repeated by an overwrite.
let method, rest;
({ [(effect(), Symbol.iterator)]: method = fallback(), ...rest } = getReceiver());
