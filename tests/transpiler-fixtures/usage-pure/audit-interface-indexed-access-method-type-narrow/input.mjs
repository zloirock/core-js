// `I['method']` indexed-access on a generic interface (TSMethodSignature shape, not
// ClassMethod) must also peel to the method's function-type, not its return-type.
// pins the TSMethodSignature branch of resolveIndexedAccessMemberAnnotationAST's
// method-shape detection - without it, interface method indexed-access bails the
// narrowing same way class method shape did
interface I<V> {
  pick(): V;
}
type Method = I<number[]>['pick'];
declare const fn: Method;
fn().at(0);
