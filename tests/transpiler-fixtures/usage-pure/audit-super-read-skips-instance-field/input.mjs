// the inverse of the field-wins rule. an instance `super.x` reads the parent PROTOTYPE, and an
// instance field never lives there - it is an own property of the instance - so the field is
// invisible to that read: with an accessor present the accessor answers, and with only a field the
// read is undefined and nothing may be narrowed. a STATIC `super.x` is the opposite: the parent
// constructor really does own its static field. only `at` and `includes` carry both an array and a
// string variant, so they are what makes the three outcomes readable - a single-family method emits
// its array helper for an unresolved receiver too and would hide the difference. the classes are
// left unexported on purpose: an escaping class makes the field writer set unenumerable, which
// switches the narrow off and would make these rows pass without testing anything
class FieldOnly { a = [1]; }
class ReadsMissing extends FieldOnly { m() { return super.a.includes(1); } }
class HasAccessor { get b() { return "s"; } }
class ReadsAccessor extends HasAccessor { b = [1]; m() { return super.b.at(0); } }
class StaticField { static c = [1]; }
class ReadsStatic extends StaticField { static m() { return super.c.includes(1); } }
