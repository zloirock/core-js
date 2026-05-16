import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// IIFE inside conditional branch: `cond ? (() => Array)() : Iterator`. outer is a
// ConditionalExpression (no IIFE peel needed at top), but each branch is recursively
// resolved through `buildDestructuringInitMeta` -- the consequent's IIFE must peel so
// branch-level resolution recovers Array as the constructor. exercises the per-branch
// recursion path through the new CallExpression case in the switch.
const {
  from
} = cond ? (() => Array)() : Iterator;
from([1, 2]);