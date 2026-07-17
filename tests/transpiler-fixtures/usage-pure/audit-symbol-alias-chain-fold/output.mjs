import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a well-known-symbol read off a SIMPLE user alias of the constructor folds to the iterator-method
// helper: the mutation-free estree resolver follows the const-alias to Symbol just as babel does
const AliasedSymbol = _Symbol;
const viaAlias = _Symbol$iterator;
export const a = _getIteratorMethod([1, 2]);

// the alias may itself be a proxy-global member chain (`globalThis.self.Symbol`)
const ChainSymbol = _Symbol;
const viaChain = _Symbol$iterator;
export const b = _getIteratorMethod([3, 4]);

// a DESTRUCTURED constructor alias folds through a DEFAULTED consumer (babel resolves the
// destructured chain in place when the default drives an inline)
const DestructuredSymbol = _Symbol;
const viaDestructuredDefault = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const c = _getIteratorMethod([5, 6]);

// the same destructured alias with a NON-defaulted consumer folds through the registered
// alias hint - the registration verified the alias shape, so the chain resolves without
// the defaulted-consumer inline
const DestructuredSymbol2 = _Symbol;
const viaDestructuredPlain = _Symbol$iterator;
export const d = _getIteratorMethod([7, 8]);

// an alias that resolves to a NON-Symbol object must never fold (wrong-value guard)
const NotSymbol = Array;
const {
  iterator: viaArray
} = NotSymbol;
export const e = [9, 10][viaArray];

// an array-wrapped destructured constructor alias (`const [{ Symbol: S }] = [globalThis]`) folds
// through the same positional peel when the consumer is defaulted
const ArrayWrapSymbol = _Symbol;
const viaArrayWrap = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const f = _getIteratorMethod([11, 12]);

// a CONSTANT-RESOLVED computed-key destructured alias (`{ [k]: S }`, key = const-bound
// string) collapses to a simple alias, whose chain-follow crosses UNCONDITIONALLY - the
// defaulted AND the plain consumer both fold
const kc = 'Symbol';
const ComputedSymbol = _Symbol;
const viaComputedDefault = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const g = _getIteratorMethod([13, 14]);
const ComputedSymbol2 = _Symbol;
const viaComputedPlain = _Symbol$iterator;
export const h = _getIteratorMethod([15, 16]);

// a computed key resolving to a NON-Symbol global must never fold (wrong-value guard)
const kn = 'Array';
const {
  [kn]: ComputedArray
} = _globalThis;
const {
  iterator: viaComputedArray = fb
} = ComputedArray;
export const i = [17, 18][viaComputedArray];

// a PROVABLY-REASSIGNED key (unconditional dominating write) resolves to the reaching
// value - the write IS the runtime key, so the chain folds and the target engine gets its
// polyfill; the dead init never drives the fold
let kr = 'Array';
kr = 'Symbol';
const ReassignedSymbol = _Symbol;
const viaReassigned = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const j = _getIteratorMethod([19, 20]);

// the key EVALUATES at the destructure - a later same-scope flip cannot reach the captured
// binding, so the reaching value AT THE CAPTURE ('Symbol') drives the fold
let kb = 'Array';
kb = 'Symbol';
const BetweenSymbol = _Symbol;
kb = 'Array';
const viaBetween = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const l = _getIteratorMethod([21, 22]);

// NEGATIVE: an indeterminable dominating VALUE (conditional expression) never resolves -
// the whole chain stays raw (a wrong-value fold would substitute the wrong slot)
let kv = 'Symbol';
kv = cond ? 'Symbol' : 'Array';
const {
  [kv]: CondValueSymbol
} = _globalThis;
const {
  iterator: viaCondValue = fb
} = CondValueSymbol;
export const m = [23, 24][viaCondValue];

// NEGATIVE (wrong-value guard): the capture reads the INIT ('Array'), so the post-capture
// flip to 'Symbol' must not fold the chain - at runtime the alias holds the Array constructor
let kd = 'Array';
const {
  [kd]: PostFlipArray
} = _globalThis;
kd = 'Symbol';
const {
  iterator: viaPostFlip = fb
} = PostFlipArray;
export const n = [25, 26][viaPostFlip];

// the inverse flip: the capture reads the init 'Symbol'; the later same-scope write cannot
// reach the captured binding, so the chain still folds to the pure constructor
let kf = 'Symbol';
const PreFlipSymbol = _Symbol;
kf = 'Array';
const viaPreFlip = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const o = _getIteratorMethod([27, 28]);

// a CONDITIONAL post-capture flip cannot reach the captured binding either - still folds
let kp = 'Symbol';
const CondFlipSymbol = _Symbol;
if (cond) kp = 'Array';
const viaCondFlip = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const q = _getIteratorMethod([29, 30]);

// NEGATIVE: a conditionally-initialized hoisted `var` key binds everywhere but holds the
// string only on the taken path - the untaken path captures globalThis[undefined], so the
// chain must stay raw (the dominance gate anchors at the capture, not the eventual use)
if (cond) var ku = 'Symbol';
const {
  [ku]: CondVarSymbol
} = _globalThis;
const {
  iterator: viaCondVar = fb
} = CondVarSymbol;
export const u = [33, 34][viaCondVar];

// NEGATIVE: a capture BEFORE the hoisted declarator reads the pre-assignment undefined -
// the init's textual position must dominate the CAPTURE, which sits above it
const {
  [kv2]: HoistedKeySymbol
} = _globalThis;
var kv2 = 'Symbol';
const {
  iterator: viaHoistedKey = fb
} = HoistedKeySymbol;
export const v = [35, 36][viaHoistedKey];

// an unconditional top-level `var` key dominates the capture like a `const` - folds
var kw = 'Symbol';
const VarKeySymbol = _Symbol;
const viaVarKey = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const w = _getIteratorMethod([37, 38]);

// an ASSIGNMENT-FORM constructor alias (`({ Symbol: S } = globalThis)`) registers a verified
// write; the consumer chain folds off the hint just like the declarator form on both emitters
let AssignedSymbol;
AssignedSymbol = _Symbol;
const viaAssigned = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const y = _getIteratorMethod([39, 40]);

// NEGATIVE: the consumer READS the alias before the aliasing write runs - the capture holds
// undefined and throws natively; a fold would silently rescue it
let LateSymbol;
const {
  iterator: viaLate = fb
} = LateSymbol;
LateSymbol = _Symbol;
export const z = [41, 42][viaLate];

// NEGATIVE: a multi-hop alias captures its source BEFORE the aliasing write - the registered
// write span must end before each hop's read, not before the eventual use
let HopSource;
const HopAlias = HopSource;
HopSource = _Symbol;
const {
  iterator: viaHop = fb
} = HopAlias;
export const aa = [43, 44][viaHop];

// NEGATIVE: a guarded aliasing write is flow-refused at registration - no fold
let GuardedSymbol;
if (cond) GuardedSymbol = _Symbol;
const {
  iterator: viaGuarded = fb
} = GuardedSymbol;
export const ab = [45, 46][viaGuarded];

// NEGATIVE: a write inside a HOISTED closure called before the capture may run before the
// read - a textual after-position proves nothing across the function boundary, so bail
let kh = 'Symbol';
flipKey();
const {
  [kh]: HoistedFlip
} = _globalThis;
const {
  iterator: viaHoistedFlip = fb
} = HoistedFlip;
export const t = [31, 32][viaHoistedFlip];
function flipKey() {
  kh = 'Array';
}