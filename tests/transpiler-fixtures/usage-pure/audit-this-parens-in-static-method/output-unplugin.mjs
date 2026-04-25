// `(this).at(0)` in static method - oxc parser preserves ParenthesizedExpression around
// `this`; babel strips. plugin must peel parens to recognise `this`-in-static as inherited
// static lookup (would-be Array.at lookup on Array constructor — bails since Array.at
// is instance-only). without peel, oxc-side falls into instance-fallback path and emits
// wrong polyfill receiver; with peel both parsers produce identical bail
class C extends Array {
  static run() { return (this).at(0); }
}