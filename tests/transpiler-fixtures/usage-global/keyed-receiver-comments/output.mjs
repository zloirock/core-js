import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// The first receiver read owns its comment before the key effect.
// Lookup and invocation reread the same value without copying the comment.
arr /* receiver */[effect(), "at"](0);