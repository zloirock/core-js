// An instance read beside object rest retains its native source and exclusions.
// The receiver call and computed key run once; rest, not call repeatability, prevents overwrite.
let method, rest;
({ [(effect(), Symbol.iterator)]: method = fallback(), ...rest } = getReceiver());
