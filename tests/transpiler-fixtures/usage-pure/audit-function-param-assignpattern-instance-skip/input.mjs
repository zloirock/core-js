// Instance-method destructure in a function param default: `handleParameterDestructure`
// guards `kind === 'instance'` and refuses to inject - a parameter default only fires on
// `arg[key] === undefined`, and writing `includes = _includes(receiver)` needs the
// receiver ref which the parameter form can't capture safely. documenting the skip
function fn({ includes } = X) {
  return includes;
}
fn;
