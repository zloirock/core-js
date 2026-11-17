// The closest declaration determines the receiver, across the surrounding enum scope.
namespace N { { enum t { A } { const t = 'ab'; t.includes('a'); } } }
