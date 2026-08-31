// `Vary` is a list, and every response this service touches has been through middleware that owns
// part of it: `cors` names `Origin`, `compression` names `Accept-Encoding`, an application doing
// its own device detection names `User-Agent`. Setting the header instead of adding to it drops
// what the others said, and what a shared cache then hands the next visitor is somebody else's
// response - the answer to a different origin, or a bundle built for a different browser
export default function varyBy(response, field) {
  const named = String(response.getHeader('vary') ?? '').split(',').map(token => token.trim().toLowerCase()).filter(Boolean);

  // `*` says the response varies by things a cache cannot see, which already covers this one
  if (named.includes('*') || named.includes(field)) return;

  response.setHeader('vary', [...named, field].join(', '));
}
