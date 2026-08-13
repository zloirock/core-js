import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.promise.constructor.js";
import "<CWD>/packages/core-js/modules/es.promise.catch.js";
import "<CWD>/packages/core-js/modules/es.promise.finally.js";
import "<CWD>/packages/core-js/modules/es.promise.resolve.js";
import "<CWD>/packages/core-js/modules/es.array.iterator.js";
import "<CWD>/packages/core-js/modules/es.array.at.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/es.map.constructor.js";
import "<CWD>/packages/core-js/modules/es.map.species.js";
import "<CWD>/packages/core-js/modules/es.map.get-or-insert.js";
import "<CWD>/packages/core-js/modules/es.map.get-or-insert-computed.js";
import "<CWD>/packages/core-js/modules/es.set.constructor.js";
import "<CWD>/packages/core-js/modules/es.set.species.js";
import "<CWD>/packages/core-js/modules/es.set.difference.js";
import "<CWD>/packages/core-js/modules/es.set.intersection.js";
import "<CWD>/packages/core-js/modules/es.set.is-disjoint-from.js";
import "<CWD>/packages/core-js/modules/es.set.is-subset-of.js";
import "<CWD>/packages/core-js/modules/es.set.is-superset-of.js";
import "<CWD>/packages/core-js/modules/es.set.symmetric-difference.js";
import "<CWD>/packages/core-js/modules/es.set.union.js";
import "<CWD>/packages/core-js/modules/es.string.iterator.js";
import "<CWD>/packages/core-js/modules/web.dom-collections.iterator.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// a BARE static read (no claim tail above it) through a chain-assignment whose value carries a
// side-effecting sequence: the value classifies through the sequence like the SE-free spelling,
// so the read injects its family instead of staying a typeless miss. the assignment is kept
// whole, so nothing depends on dropping the effect. one family per row: a sequence WRAPPING the
// navigation, and a navigation ROOTED at the sequence
let q;
const arr = [1];
export const viaSeqWrapped = (q = (Promise.resolve(1), globalThis.self)).Map;
export const viaSeqRooted = (q = (arr.at(0), globalThis).self).Set;