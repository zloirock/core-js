// a well-known-symbol read off a SIMPLE user alias of the constructor folds to the iterator-method
// helper: the mutation-free estree resolver follows the const-alias to Symbol just as babel does
const AliasedSymbol = Symbol;
const { iterator: viaAlias } = AliasedSymbol;
export const a = [1, 2][viaAlias];

// the alias may itself be a proxy-global member chain (`globalThis.self.Symbol`)
const ChainSymbol = globalThis.self.Symbol;
const { iterator: viaChain } = ChainSymbol;
export const b = [3, 4][viaChain];

// a DESTRUCTURED constructor alias folds through a DEFAULTED consumer (babel resolves the
// destructured chain in place when the default drives an inline)
const { self: { Symbol: DestructuredSymbol } } = globalThis;
const { iterator: viaDestructuredDefault = fb } = DestructuredSymbol;
export const c = [5, 6][viaDestructuredDefault];

// the same destructured alias with a NON-defaulted consumer folds through the registered
// alias hint - the registration verified the alias shape, so the chain resolves without
// the defaulted-consumer inline
const { self: { Symbol: DestructuredSymbol2 } } = globalThis;
const { iterator: viaDestructuredPlain } = DestructuredSymbol2;
export const d = [7, 8][viaDestructuredPlain];

// an alias that resolves to a NON-Symbol object must never fold (wrong-value guard)
const NotSymbol = Array;
const { iterator: viaArray } = NotSymbol;
export const e = [9, 10][viaArray];

// an array-wrapped destructured constructor alias (`const [{ Symbol: S }] = [globalThis]`) folds
// through the same positional peel when the consumer is defaulted
const [{ Symbol: ArrayWrapSymbol }] = [globalThis];
const { iterator: viaArrayWrap = fb } = ArrayWrapSymbol;
export const f = [11, 12][viaArrayWrap];

// a CONSTANT-RESOLVED computed-key destructured alias (`{ [k]: S }`, key = const-bound
// string) collapses to a simple alias, whose chain-follow crosses UNCONDITIONALLY - the
// defaulted AND the plain consumer both fold
const kc = 'Symbol';
const { [kc]: ComputedSymbol } = globalThis;
const { iterator: viaComputedDefault = fb } = ComputedSymbol;
export const g = [13, 14][viaComputedDefault];
const { [kc]: ComputedSymbol2 } = globalThis;
const { iterator: viaComputedPlain } = ComputedSymbol2;
export const h = [15, 16][viaComputedPlain];

// a computed key resolving to a NON-Symbol global must never fold (wrong-value guard)
const kn = 'Array';
const { [kn]: ComputedArray } = globalThis;
const { iterator: viaComputedArray = fb } = ComputedArray;
export const i = [17, 18][viaComputedArray];

// a PROVABLY-REASSIGNED key (unconditional dominating write) resolves to the reaching
// value - the write IS the runtime key, so the chain folds and the target engine gets its
// polyfill; the dead init never drives the fold
let kr = 'Array';
kr = 'Symbol';
const { [kr]: ReassignedSymbol } = globalThis;
const { iterator: viaReassigned = fb } = ReassignedSymbol;
export const j = [19, 20][viaReassigned];

// the key EVALUATES at the destructure - a later same-scope flip cannot reach the captured
// binding, so the reaching value AT THE CAPTURE ('Symbol') drives the fold
let kb = 'Array';
kb = 'Symbol';
const { [kb]: BetweenSymbol } = globalThis;
kb = 'Array';
const { iterator: viaBetween = fb } = BetweenSymbol;
export const l = [21, 22][viaBetween];

// NEGATIVE: an indeterminable dominating VALUE (conditional expression) never resolves -
// the whole chain stays raw (a wrong-value fold would substitute the wrong slot)
let kv = 'Symbol';
kv = cond ? 'Symbol' : 'Array';
const { [kv]: CondValueSymbol } = globalThis;
const { iterator: viaCondValue = fb } = CondValueSymbol;
export const m = [23, 24][viaCondValue];

// NEGATIVE (wrong-value guard): the capture reads the INIT ('Array'), so the post-capture
// flip to 'Symbol' must not fold the chain - at runtime the alias holds the Array constructor
let kd = 'Array';
const { [kd]: PostFlipArray } = globalThis;
kd = 'Symbol';
const { iterator: viaPostFlip = fb } = PostFlipArray;
export const n = [25, 26][viaPostFlip];

// the inverse flip: the capture reads the init 'Symbol'; the later same-scope write cannot
// reach the captured binding, so the chain still folds to the pure constructor
let kf = 'Symbol';
const { [kf]: PreFlipSymbol } = globalThis;
kf = 'Array';
const { iterator: viaPreFlip = fb } = PreFlipSymbol;
export const o = [27, 28][viaPreFlip];

// a CONDITIONAL post-capture flip cannot reach the captured binding either - still folds
let kp = 'Symbol';
const { [kp]: CondFlipSymbol } = globalThis;
if (cond) kp = 'Array';
const { iterator: viaCondFlip = fb } = CondFlipSymbol;
export const q = [29, 30][viaCondFlip];

// NEGATIVE: a conditionally-initialized hoisted `var` key binds everywhere but holds the
// string only on the taken path - the untaken path captures globalThis[undefined], so the
// chain must stay raw (the dominance gate anchors at the capture, not the eventual use)
if (cond) var ku = 'Symbol';
const { [ku]: CondVarSymbol } = globalThis;
const { iterator: viaCondVar = fb } = CondVarSymbol;
export const u = [33, 34][viaCondVar];

// NEGATIVE: a capture BEFORE the hoisted declarator reads the pre-assignment undefined -
// the init's textual position must dominate the CAPTURE, which sits above it
const { [kv2]: HoistedKeySymbol } = globalThis;
var kv2 = 'Symbol';
const { iterator: viaHoistedKey = fb } = HoistedKeySymbol;
export const v = [35, 36][viaHoistedKey];

// an unconditional top-level `var` key dominates the capture like a `const` - folds
var kw = 'Symbol';
const { [kw]: VarKeySymbol } = globalThis;
const { iterator: viaVarKey = fb } = VarKeySymbol;
export const w = [37, 38][viaVarKey];

// an ASSIGNMENT-FORM constructor alias (`({ Symbol: S } = globalThis)`) registers a verified
// write; the consumer chain folds off the hint just like the declarator form on both emitters
let AssignedSymbol;
({ Symbol: AssignedSymbol } = globalThis);
const { iterator: viaAssigned = fb } = AssignedSymbol;
export const y = [39, 40][viaAssigned];

// NEGATIVE: the consumer READS the alias before the aliasing write runs - the capture holds
// undefined and throws natively; a fold would silently rescue it
let LateSymbol;
const { iterator: viaLate = fb } = LateSymbol;
({ Symbol: LateSymbol } = globalThis);
export const z = [41, 42][viaLate];

// NEGATIVE: a multi-hop alias captures its source BEFORE the aliasing write - the registered
// write span must end before each hop's read, not before the eventual use
let HopSource;
const HopAlias = HopSource;
({ Symbol: HopSource } = globalThis);
const { iterator: viaHop = fb } = HopAlias;
export const aa = [43, 44][viaHop];

// NEGATIVE: a guarded aliasing write is flow-refused at registration - no fold
let GuardedSymbol;
if (cond) ({ Symbol: GuardedSymbol } = globalThis);
const { iterator: viaGuarded = fb } = GuardedSymbol;
export const ab = [45, 46][viaGuarded];

// NEGATIVE: a write inside a HOISTED closure called before the capture may run before the
// read - a textual after-position proves nothing across the function boundary, so bail
let kh = 'Symbol';
flipKey();
const { [kh]: HoistedFlip } = globalThis;
const { iterator: viaHoistedFlip = fb } = HoistedFlip;
export const t = [31, 32][viaHoistedFlip];
function flipKey() { kh = 'Array'; }
