import _at from "@core-js/pure/actual/instance/at";
// The first receiver read owns its comment before the key effect.
// Lookup and invocation reread the same value without copying the comment.
arr /* receiver */, effect(), _at(arr).call(arr, 0);