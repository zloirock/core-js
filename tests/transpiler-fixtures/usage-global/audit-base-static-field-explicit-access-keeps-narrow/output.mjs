import "core-js/modules/es.array.at";
// `Base.items` names the class explicitly, so it reads Base's own static slot regardless of
// any subclass shadow. the narrow stays precise even though `Sub` overrides the field - the
// shadow guard only applies to `this`-rooted reads where the runtime receiver can be a subclass
class Base {
  static items: number[] = [];
}
class Sub extends Base {
  static items: any = "shadowed";
}
Base.items.at(-1);