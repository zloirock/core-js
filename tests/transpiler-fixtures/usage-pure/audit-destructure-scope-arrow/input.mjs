// destructure with default value inside an arrow expression body: the temporary
// ref binding is hoisted to the arrow's local scope (not module-level) so the rewrite
// remains valid when the arrow is evaluated multiple times
const f = () => { const { includes = fallback } = getArr(); return includes; };
