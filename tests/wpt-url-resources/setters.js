/* eslint-disable no-script-url */
export default {
  protocol: [
    {
      comment: 'The empty string is not a valid scheme. Setter leaves the URL unchanged.',
      href: 'a://example.net',
      newValue: '',
      expected: {
        href: 'a://example.net',
        protocol: 'a:',
      },
    },
    {
      href: 'a://example.net',
      newValue: 'b',
      expected: {
        href: 'b://example.net',
        protocol: 'b:',
      },
    },
    {
      href: 'javascript:alert(1)',
      newValue: 'defuse',
      expected: {
        href: 'defuse:alert(1)',
        protocol: 'defuse:',
      },
    },
    {
      comment: 'Upper-case ASCII is lower-cased',
      href: 'a://example.net',
      newValue: 'B',
      expected: {
        href: 'b://example.net',
        protocol: 'b:',
      },
    },
    {
      comment: 'Non-ASCII is rejected',
      href: 'a://example.net',
      newValue: 'é',
      expected: {
        href: 'a://example.net',
        protocol: 'a:',
      },
    },
    {
      comment: 'No leading digit',
      href: 'a://example.net',
      newValue: '0b',
      expected: {
        href: 'a://example.net',
        protocol: 'a:',
      },
    },
    {
      comment: 'No leading punctuation',
      href: 'a://example.net',
      newValue: '+b',
      expected: {
        href: 'a://example.net',
        protocol: 'a:',
      },
    },
    {
      href: 'a://example.net',
      newValue: 'bC0+-.',
      expected: {
        href: 'bc0+-.://example.net',
        protocol: 'bc0+-.:',
      },
    },
    {
      comment: 'Only some punctuation is acceptable',
      href: 'a://example.net',
      newValue: 'b,c',
      expected: {
        href: 'a://example.net',
        protocol: 'a:',
      },
    },
    {
      comment: 'Non-ASCII is rejected',
      href: 'a://example.net',
      newValue: 'bé',
      expected: {
        href: 'a://example.net',
        protocol: 'a:',
      },
    },
    {
      comment: 'Can’t switch from URL containing username/password/port to file',
      href: 'http://test@example.net',
      newValue: 'file',
      expected: {
        href: 'http://test@example.net/',
        protocol: 'http:',
      },
    },
    {
      href: 'wss://x:x@example.net:1234',
      newValue: 'file',
      expected: {
        href: 'wss://x:x@example.net:1234/',
        protocol: 'wss:',
      },
    },
    {
      comment: 'Can’t switch from file URL with no host',
      href: 'file://localhost/',
      newValue: 'http',
      expected: {
        href: 'file:///',
        protocol: 'file:',
      },
    },
    {
      href: 'file:',
      newValue: 'wss',
      expected: {
        href: 'file:///',
        protocol: 'file:',
      },
    },
    {
      comment: 'Can’t switch from special scheme to non-special',
      href: 'http://example.net',
      newValue: 'b',
      expected: {
        href: 'http://example.net/',
        protocol: 'http:',
      },
    },
    {
      href: 'file://hi/path',
      newValue: 's',
      expected: {
        href: 'file://hi/path',
        protocol: 'file:',
      },
    },
    {
      href: 'https://example.net',
      newValue: 's',
      expected: {
        href: 'https://example.net/',
        protocol: 'https:',
      },
    },
    {
      href: 'ftp://example.net',
      newValue: 'test',
      expected: {
        href: 'ftp://example.net/',
        protocol: 'ftp:',
      },
    },
    {
      comment: 'Cannot-be-a-base URL doesn’t have a host, but URL in a special scheme must.',
      href: 'mailto:me@example.net',
      newValue: 'http',
      expected: {
        href: 'mailto:me@example.net',
        protocol: 'mailto:',
      },
    },
    {
      comment: 'Can’t switch from non-special scheme to special',
      href: 'ssh://me@example.net',
      newValue: 'http',
      expected: {
        href: 'ssh://me@example.net',
        protocol: 'ssh:',
      },
    },
    {
      href: 'ssh://me@example.net',
      newValue: 'file',
      expected: {
        href: 'ssh://me@example.net',
        protocol: 'ssh:',
      },
    },
    {
      href: 'ssh://example.net',
      newValue: 'file',
      expected: {
        href: 'ssh://example.net',
        protocol: 'ssh:',
      },
    },
    {
      href: 'nonsense:///test',
      newValue: 'https',
      expected: {
        href: 'nonsense:///test',
        protocol: 'nonsense:',
      },
    },
    {
      comment: "Stuff after the first ':' is ignored",
      href: 'http://example.net',
      newValue: 'https:foo : bar',
      expected: {
        href: 'https://example.net/',
        protocol: 'https:',
      },
    },
    {
      comment: "Stuff after the first ':' is ignored",
      href: 'data:text/html,<p>Test',
      newValue: 'view-source+data:foo : bar',
      expected: {
        href: 'view-source+data:text/html,<p>Test',
        protocol: 'view-source+data:',
      },
    },
    {
      comment: 'Port is set to null if it is the default for new scheme.',
      href: 'http://foo.com:443/',
      newValue: 'https',
      expected: {
        href: 'https://foo.com/',
        protocol: 'https:',
        port: '',
      },
    },
  ],
  username: [
    {
      comment: 'No host means no username',
      href: 'file:///home/you/index.html',
      newValue: 'me',
      expected: {
        href: 'file:///home/you/index.html',
        username: '',
      },
    },
    {
      comment: 'No host means no username',
      href: 'unix:/run/foo.socket',
      newValue: 'me',
      expected: {
        href: 'unix:/run/foo.socket',
        username: '',
      },
    },
    {
      comment: 'Cannot-be-a-base means no username',
      href: 'mailto:you@example.net',
      newValue: 'me',
      expected: {
        href: 'mailto:you@example.net',
        username: '',
      },
    },
    {
      href: 'javascript:alert(1)',
      newValue: 'wario',
      expected: {
        href: 'javascript:alert(1)',
        username: '',
      },
    },
    {
      href: 'http://example.net',
      newValue: 'me',
      expected: {
        href: 'http://me@example.net/',
        username: 'me',
      },
    },
    {
      href: 'http://:secret@example.net',
      newValue: 'me',
      expected: {
        href: 'http://me:secret@example.net/',
        username: 'me',
      },
    },
    {
      href: 'http://me@example.net',
      newValue: '',
      expected: {
        href: 'http://example.net/',
        username: '',
      },
    },
    {
      href: 'http://me:secret@example.net',
      newValue: '',
      expected: {
        href: 'http://:secret@example.net/',
        username: '',
      },
    },
    {
      comment: 'UTF-8 percent encoding with the userinfo encode set.',
      href: 'http://example.net',
      newValue: "\u0000\u0001\t\n\r\u001f !\"#$%&'()*+,-./09:;<=>?@AZ[\\]^_`az{|}~\u007f\u0080\u0081Éé",
      expected: {
        href: "http://%00%01%09%0A%0D%1F%20!%22%23$%&'()*+,-.%2F09%3A%3B%3C%3D%3E%3F%40AZ%5B%5C%5D%5E_%60az%7B%7C%7D~%7F%C2%80%C2%81%C3%89%C3%A9@example.net/",
        username: "%00%01%09%0A%0D%1F%20!%22%23$%&'()*+,-.%2F09%3A%3B%3C%3D%3E%3F%40AZ%5B%5C%5D%5E_%60az%7B%7C%7D~%7F%C2%80%C2%81%C3%89%C3%A9",
      },
    },
    {
      comment: 'Bytes already percent-encoded are left as-is.',
      href: 'http://example.net',
      newValue: '%c3%89té',
      expected: {
        href: 'http://%c3%89t%C3%A9@example.net/',
        username: '%c3%89t%C3%A9',
      },
    },
    {
      href: 'sc:///',
      newValue: 'x',
      expected: {
        href: 'sc:///',
        username: '',
      },
    },
    {
      href: 'javascript://x/',
      newValue: 'wario',
      expected: {
        href: 'javascript://wario@x/',
        username: 'wario',
      },
    },
    {
      href: 'file://test/',
      newValue: 'test',
      expected: {
        href: 'file://test/',
        username: '',
      },
    },
  ],
  password: [
    {
      comment: 'No host means no password',
      href: 'file:///home/me/index.html',
      newValue: 'secret',
      expected: {
        href: 'file:///home/me/index.html',
        password: '',
      },
    },
    {
      comment: 'No host means no password',
      href: 'unix:/run/foo.socket',
      newValue: 'secret',
      expected: {
        href: 'unix:/run/foo.socket',
        password: '',
      },
    },
    {
      comment: 'Cannot-be-a-base means no password',
      href: 'mailto:me@example.net',
      newValue: 'secret',
      expected: {
        href: 'mailto:me@example.net',
        password: '',
      },
    },
    {
      href: 'http://example.net',
      newValue: 'secret',
      expected: {
        href: 'http://:secret@example.net/',
        password: 'secret',
      },
    },
    {
      href: 'http://me@example.net',
      newValue: 'secret',
      expected: {
        href: 'http://me:secret@example.net/',
        password: 'secret',
      },
    },
    {
      href: 'http://:secret@example.net',
      newValue: '',
      expected: {
        href: 'http://example.net/',
        password: '',
      },
    },
    {
      href: 'http://me:secret@example.net',
      newValue: '',
      expected: {
        href: 'http://me@example.net/',
        password: '',
      },
    },
    {
      comment: 'UTF-8 percent encoding with the userinfo encode set.',
      href: 'http://example.net',
      newValue: "\u0000\u0001\t\n\r\u001f !\"#$%&'()*+,-./09:;<=>?@AZ[\\]^_`az{|}~\u007f\u0080\u0081Éé",
      expected: {
        href: "http://:%00%01%09%0A%0D%1F%20!%22%23$%&'()*+,-.%2F09%3A%3B%3C%3D%3E%3F%40AZ%5B%5C%5D%5E_%60az%7B%7C%7D~%7F%C2%80%C2%81%C3%89%C3%A9@example.net/",
        password: "%00%01%09%0A%0D%1F%20!%22%23$%&'()*+,-.%2F09%3A%3B%3C%3D%3E%3F%40AZ%5B%5C%5D%5E_%60az%7B%7C%7D~%7F%C2%80%C2%81%C3%89%C3%A9",
      },
    },
    {
      comment: 'Bytes already percent-encoded are left as-is.',
      href: 'http://example.net',
      newValue: '%c3%89té',
      expected: {
        href: 'http://:%c3%89t%C3%A9@example.net/',
        password: '%c3%89t%C3%A9',
      },
    },
    {
      href: 'sc:///',
      newValue: 'x',
      expected: {
        href: 'sc:///',
        password: '',
      },
    },
    {
      href: 'javascript://x/',
      newValue: 'bowser',
      expected: {
        href: 'javascript://:bowser@x/',
        password: 'bowser',
      },
    },
    {
      href: 'file://test/',
      newValue: 'test',
      expected: {
        href: 'file://test/',
        password: '',
      },
    },
  ],
  host: [
    {
      comment: 'Non-special scheme',
      href: 'sc://x/',
      newValue: '\u0000',
      expected: {
        href: 'sc://x/',
        host: 'x',
        hostname: 'x',
      },
    },
    {
      href: 'sc://x/',
      newValue: '\u0009',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '\u000A',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '\u000D',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: ' ',
      expected: {
        href: 'sc://x/',
        host: 'x',
        hostname: 'x',
      },
    },
    {
      href: 'sc://x/',
      newValue: '#',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '/',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '?',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '@',
      expected: {
        href: 'sc://x/',
        host: 'x',
        hostname: 'x',
      },
    },
    {
      href: 'sc://x/',
      newValue: 'ß',
      expected: {
        href: 'sc://%C3%9F/',
        host: '%C3%9F',
        hostname: '%C3%9F',
      },
    },
    {
      comment: 'IDNA Nontransitional_Processing',
      href: 'https://x/',
      newValue: 'ß',
      expected: {
        href: 'https://xn--zca/',
        host: 'xn--zca',
        hostname: 'xn--zca',
      },
    },
    {
      comment: 'Cannot-be-a-base means no host',
      href: 'mailto:me@example.net',
      newValue: 'example.com',
      expected: {
        href: 'mailto:me@example.net',
        host: '',
      },
    },
    {
      comment: 'Cannot-be-a-base means no password',
      href: 'data:text/plain,Stuff',
      newValue: 'example.net',
      expected: {
        href: 'data:text/plain,Stuff',
        host: '',
      },
    },
    {
      href: 'http://example.net',
      newValue: 'example.com:8080',
      expected: {
        href: 'http://example.com:8080/',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'Port number is unchanged if not specified in the new value',
      href: 'http://example.net:8080',
      newValue: 'example.com',
      expected: {
        href: 'http://example.com:8080/',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'Port number is unchanged if not specified',
      href: 'http://example.net:8080',
      newValue: 'example.com:',
      expected: {
        href: 'http://example.com:8080/',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'The empty host is not valid for special schemes',
      href: 'http://example.net',
      newValue: '',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
      },
    },
    {
      comment: 'The empty host is OK for non-special schemes',
      href: 'view-source+http://example.net/foo',
      newValue: '',
      expected: {
        href: 'view-source+http:///foo',
        host: '',
      },
    },
    {
      comment: 'Path-only URLs can gain a host',
      href: 'a:/foo',
      newValue: 'example.net',
      expected: {
        href: 'a://example.net/foo',
        host: 'example.net',
      },
    },
    {
      comment: 'IPv4 address syntax is normalized',
      href: 'http://example.net',
      newValue: '0x7F000001:8080',
      expected: {
        href: 'http://127.0.0.1:8080/',
        host: '127.0.0.1:8080',
        hostname: '127.0.0.1',
        port: '8080',
      },
    },
    {
      comment: 'IPv6 address syntax is normalized',
      href: 'http://example.net',
      newValue: '[::0:01]:2',
      expected: {
        href: 'http://[::1]:2/',
        host: '[::1]:2',
        hostname: '[::1]',
        port: '2',
      },
    },
    {
      comment: 'Default port number is removed',
      href: 'http://example.net',
      newValue: 'example.com:80',
      expected: {
        href: 'http://example.com/',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Default port number is removed',
      href: 'https://example.net',
      newValue: 'example.com:443',
      expected: {
        href: 'https://example.com/',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Default port number is only removed for the relevant scheme',
      href: 'https://example.net',
      newValue: 'example.com:80',
      expected: {
        href: 'https://example.com:80/',
        host: 'example.com:80',
        hostname: 'example.com',
        port: '80',
      },
    },
    {
      comment: 'Port number is removed if new port is scheme default and existing URL has a non-default port',
      href: 'http://example.net:8080',
      newValue: 'example.com:80',
      expected: {
        href: 'http://example.com/',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Stuff after a / delimiter is ignored',
      href: 'http://example.net/path',
      newValue: 'example.com/stuff',
      expected: {
        href: 'http://example.com/path',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Stuff after a / delimiter is ignored',
      href: 'http://example.net/path',
      newValue: 'example.com:8080/stuff',
      expected: {
        href: 'http://example.com:8080/path',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'Stuff after a ? delimiter is ignored',
      href: 'http://example.net/path',
      newValue: 'example.com?stuff',
      expected: {
        href: 'http://example.com/path',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Stuff after a ? delimiter is ignored',
      href: 'http://example.net/path',
      newValue: 'example.com:8080?stuff',
      expected: {
        href: 'http://example.com:8080/path',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'Stuff after a # delimiter is ignored',
      href: 'http://example.net/path',
      newValue: 'example.com#stuff',
      expected: {
        href: 'http://example.com/path',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Stuff after a # delimiter is ignored',
      href: 'http://example.net/path',
      newValue: 'example.com:8080#stuff',
      expected: {
        href: 'http://example.com:8080/path',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'Stuff after a \\ delimiter is ignored for special schemes',
      href: 'http://example.net/path',
      newValue: 'example.com\\stuff',
      expected: {
        href: 'http://example.com/path',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Stuff after a \\ delimiter is ignored for special schemes',
      href: 'http://example.net/path',
      newValue: 'example.com:8080\\stuff',
      expected: {
        href: 'http://example.com:8080/path',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: '\\ is not a delimiter for non-special schemes, but still forbidden in hosts',
      href: 'view-source+http://example.net/path',
      newValue: 'example.com\\stuff',
      expected: {
        href: 'view-source+http://example.net/path',
        host: 'example.net',
        hostname: 'example.net',
        port: '',
      },
    },
    {
      comment: 'Anything other than ASCII digit stops the port parser in a setter but is not an error',
      href: 'view-source+http://example.net/path',
      newValue: 'example.com:8080stuff2',
      expected: {
        href: 'view-source+http://example.com:8080/path',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'Anything other than ASCII digit stops the port parser in a setter but is not an error',
      href: 'http://example.net/path',
      newValue: 'example.com:8080stuff2',
      expected: {
        href: 'http://example.com:8080/path',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'Anything other than ASCII digit stops the port parser in a setter but is not an error',
      href: 'http://example.net/path',
      newValue: 'example.com:8080+2',
      expected: {
        href: 'http://example.com:8080/path',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'Port numbers are 16 bit integers',
      href: 'http://example.net/path',
      newValue: 'example.com:65535',
      expected: {
        href: 'http://example.com:65535/path',
        host: 'example.com:65535',
        hostname: 'example.com',
        port: '65535',
      },
    },
    {
      comment: 'Port numbers are 16 bit integers, overflowing is an error. Hostname is still set, though.',
      href: 'http://example.net/path',
      newValue: 'example.com:65536',
      expected: {
        href: 'http://example.com/path',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Broken IPv6',
      href: 'http://example.net/',
      newValue: '[google.com]',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
      },
    },
    {
      href: 'http://example.net/',
      newValue: '[::1.2.3.4x]',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
      },
    },
    {
      href: 'http://example.net/',
      newValue: '[::1.2.3.]',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
      },
    },
    {
      href: 'http://example.net/',
      newValue: '[::1.2.]',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
      },
    },
    {
      href: 'http://example.net/',
      newValue: '[::1.]',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
      },
    },
    {
      href: 'file://y/',
      newValue: 'x:123',
      expected: {
        href: 'file://y/',
        host: 'y',
        hostname: 'y',
        port: '',
      },
    },
    {
      href: 'file://y/',
      newValue: 'loc%41lhost',
      expected: {
        href: 'file:///',
        host: '',
        hostname: '',
        port: '',
      },
    },
    {
      href: 'file://hi/x',
      newValue: '',
      expected: {
        href: 'file:///x',
        host: '',
        hostname: '',
        port: '',
      },
    },
    {
      href: 'sc://test@test/',
      newValue: '',
      expected: {
        href: 'sc://test@test/',
        host: 'test',
        hostname: 'test',
        username: 'test',
      },
    },
    {
      href: 'sc://test:12/',
      newValue: '',
      expected: {
        href: 'sc://test:12/',
        host: 'test:12',
        hostname: 'test',
        port: '12',
      },
    },
  ],
  hostname: [
    {
      comment: 'Non-special scheme',
      href: 'sc://x/',
      newValue: '\u0000',
      expected: {
        href: 'sc://x/',
        host: 'x',
        hostname: 'x',
      },
    },
    {
      href: 'sc://x/',
      newValue: '\u0009',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '\u000A',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '\u000D',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: ' ',
      expected: {
        href: 'sc://x/',
        host: 'x',
        hostname: 'x',
      },
    },
    {
      href: 'sc://x/',
      newValue: '#',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '/',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '?',
      expected: {
        href: 'sc:///',
        host: '',
        hostname: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '@',
      expected: {
        href: 'sc://x/',
        host: 'x',
        hostname: 'x',
      },
    },
    {
      comment: 'Cannot-be-a-base means no host',
      href: 'mailto:me@example.net',
      newValue: 'example.com',
      expected: {
        href: 'mailto:me@example.net',
        host: '',
      },
    },
    {
      comment: 'Cannot-be-a-base means no password',
      href: 'data:text/plain,Stuff',
      newValue: 'example.net',
      expected: {
        href: 'data:text/plain,Stuff',
        host: '',
      },
    },
    {
      href: 'http://example.net:8080',
      newValue: 'example.com',
      expected: {
        href: 'http://example.com:8080/',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'The empty host is not valid for special schemes',
      href: 'http://example.net',
      newValue: '',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
      },
    },
    {
      comment: 'The empty host is OK for non-special schemes',
      href: 'view-source+http://example.net/foo',
      newValue: '',
      expected: {
        href: 'view-source+http:///foo',
        host: '',
      },
    },
    {
      comment: 'Path-only URLs can gain a host',
      href: 'a:/foo',
      newValue: 'example.net',
      expected: {
        href: 'a://example.net/foo',
        host: 'example.net',
      },
    },
    {
      comment: 'IPv4 address syntax is normalized',
      href: 'http://example.net:8080',
      newValue: '0x7F000001',
      expected: {
        href: 'http://127.0.0.1:8080/',
        host: '127.0.0.1:8080',
        hostname: '127.0.0.1',
        port: '8080',
      },
    },
    {
      comment: 'IPv6 address syntax is normalized',
      href: 'http://example.net',
      newValue: '[::0:01]',
      expected: {
        href: 'http://[::1]/',
        host: '[::1]',
        hostname: '[::1]',
        port: '',
      },
    },
    {
      comment: 'Stuff after a : delimiter is ignored',
      href: 'http://example.net/path',
      newValue: 'example.com:8080',
      expected: {
        href: 'http://example.com/path',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Stuff after a : delimiter is ignored',
      href: 'http://example.net:8080/path',
      newValue: 'example.com:',
      expected: {
        href: 'http://example.com:8080/path',
        host: 'example.com:8080',
        hostname: 'example.com',
        port: '8080',
      },
    },
    {
      comment: 'Stuff after a / delimiter is ignored',
      href: 'http://example.net/path',
      newValue: 'example.com/stuff',
      expected: {
        href: 'http://example.com/path',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Stuff after a ? delimiter is ignored',
      href: 'http://example.net/path',
      newValue: 'example.com?stuff',
      expected: {
        href: 'http://example.com/path',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Stuff after a # delimiter is ignored',
      href: 'http://example.net/path',
      newValue: 'example.com#stuff',
      expected: {
        href: 'http://example.com/path',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: 'Stuff after a \\ delimiter is ignored for special schemes',
      href: 'http://example.net/path',
      newValue: 'example.com\\stuff',
      expected: {
        href: 'http://example.com/path',
        host: 'example.com',
        hostname: 'example.com',
        port: '',
      },
    },
    {
      comment: '\\ is not a delimiter for non-special schemes, but still forbidden in hosts',
      href: 'view-source+http://example.net/path',
      newValue: 'example.com\\stuff',
      expected: {
        href: 'view-source+http://example.net/path',
        host: 'example.net',
        hostname: 'example.net',
        port: '',
      },
    },
    {
      comment: 'Broken IPv6',
      href: 'http://example.net/',
      newValue: '[google.com]',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
      },
    },
    {
      href: 'http://example.net/',
      newValue: '[::1.2.3.4x]',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
      },
    },
    {
      href: 'http://example.net/',
      newValue: '[::1.2.3.]',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
      },
    },
    {
      href: 'http://example.net/',
      newValue: '[::1.2.]',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
      },
    },
    {
      href: 'http://example.net/',
      newValue: '[::1.]',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
      },
    },
    {
      href: 'file://y/',
      newValue: 'x:123',
      expected: {
        href: 'file://y/',
        host: 'y',
        hostname: 'y',
        port: '',
      },
    },
    {
      href: 'file://y/',
      newValue: 'loc%41lhost',
      expected: {
        href: 'file:///',
        host: '',
        hostname: '',
        port: '',
      },
    },
    {
      href: 'file://hi/x',
      newValue: '',
      expected: {
        href: 'file:///x',
        host: '',
        hostname: '',
        port: '',
      },
    },
    {
      href: 'sc://test@test/',
      newValue: '',
      expected: {
        href: 'sc://test@test/',
        host: 'test',
        hostname: 'test',
        username: 'test',
      },
    },
    {
      href: 'sc://test:12/',
      newValue: '',
      expected: {
        href: 'sc://test:12/',
        host: 'test:12',
        hostname: 'test',
        port: '12',
      },
    },
  ],
  port: [
    {
      href: 'http://example.net',
      newValue: '8080',
      expected: {
        href: 'http://example.net:8080/',
        host: 'example.net:8080',
        hostname: 'example.net',
        port: '8080',
      },
    },
    {
      comment: 'Port number is removed if empty is the new value',
      href: 'http://example.net:8080',
      newValue: '',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
        port: '',
      },
    },
    {
      comment: 'Default port number is removed',
      href: 'http://example.net:8080',
      newValue: '80',
      expected: {
        href: 'http://example.net/',
        host: 'example.net',
        hostname: 'example.net',
        port: '',
      },
    },
    {
      comment: 'Default port number is removed',
      href: 'https://example.net:4433',
      newValue: '443',
      expected: {
        href: 'https://example.net/',
        host: 'example.net',
        hostname: 'example.net',
        port: '',
      },
    },
    {
      comment: 'Default port number is only removed for the relevant scheme',
      href: 'https://example.net',
      newValue: '80',
      expected: {
        href: 'https://example.net:80/',
        host: 'example.net:80',
        hostname: 'example.net',
        port: '80',
      },
    },
    {
      comment: 'Stuff after a / delimiter is ignored',
      href: 'http://example.net/path',
      newValue: '8080/stuff',
      expected: {
        href: 'http://example.net:8080/path',
        host: 'example.net:8080',
        hostname: 'example.net',
        port: '8080',
      },
    },
    {
      comment: 'Stuff after a ? delimiter is ignored',
      href: 'http://example.net/path',
      newValue: '8080?stuff',
      expected: {
        href: 'http://example.net:8080/path',
        host: 'example.net:8080',
        hostname: 'example.net',
        port: '8080',
      },
    },
    {
      comment: 'Stuff after a # delimiter is ignored',
      href: 'http://example.net/path',
      newValue: '8080#stuff',
      expected: {
        href: 'http://example.net:8080/path',
        host: 'example.net:8080',
        hostname: 'example.net',
        port: '8080',
      },
    },
    {
      comment: 'Stuff after a \\ delimiter is ignored for special schemes',
      href: 'http://example.net/path',
      newValue: '8080\\stuff',
      expected: {
        href: 'http://example.net:8080/path',
        host: 'example.net:8080',
        hostname: 'example.net',
        port: '8080',
      },
    },
    {
      comment: 'Anything other than ASCII digit stops the port parser in a setter but is not an error',
      href: 'view-source+http://example.net/path',
      newValue: '8080stuff2',
      expected: {
        href: 'view-source+http://example.net:8080/path',
        host: 'example.net:8080',
        hostname: 'example.net',
        port: '8080',
      },
    },
    {
      comment: 'Anything other than ASCII digit stops the port parser in a setter but is not an error',
      href: 'http://example.net/path',
      newValue: '8080stuff2',
      expected: {
        href: 'http://example.net:8080/path',
        host: 'example.net:8080',
        hostname: 'example.net',
        port: '8080',
      },
    },
    {
      comment: 'Anything other than ASCII digit stops the port parser in a setter but is not an error',
      href: 'http://example.net/path',
      newValue: '8080+2',
      expected: {
        href: 'http://example.net:8080/path',
        host: 'example.net:8080',
        hostname: 'example.net',
        port: '8080',
      },
    },
    {
      comment: 'Port numbers are 16 bit integers',
      href: 'http://example.net/path',
      newValue: '65535',
      expected: {
        href: 'http://example.net:65535/path',
        host: 'example.net:65535',
        hostname: 'example.net',
        port: '65535',
      },
    },
    {
      comment: 'Port numbers are 16 bit integers, overflowing is an error',
      href: 'http://example.net:8080/path',
      newValue: '65536',
      expected: {
        href: 'http://example.net:8080/path',
        host: 'example.net:8080',
        hostname: 'example.net',
        port: '8080',
      },
    },
    {
      comment: 'Port numbers are 16 bit integers, overflowing is an error',
      href: 'non-special://example.net:8080/path',
      newValue: '65536',
      expected: {
        href: 'non-special://example.net:8080/path',
        host: 'example.net:8080',
        hostname: 'example.net',
        port: '8080',
      },
    },
    {
      href: 'file://test/',
      newValue: '12',
      expected: {
        href: 'file://test/',
        port: '',
      },
    },
    {
      href: 'file://localhost/',
      newValue: '12',
      expected: {
        href: 'file:///',
        port: '',
      },
    },
    {
      href: 'non-base:value',
      newValue: '12',
      expected: {
        href: 'non-base:value',
        port: '',
      },
    },
    {
      href: 'sc:///',
      newValue: '12',
      expected: {
        href: 'sc:///',
        port: '',
      },
    },
    {
      href: 'sc://x/',
      newValue: '12',
      expected: {
        href: 'sc://x:12/',
        port: '12',
      },
    },
    {
      href: 'javascript://x/',
      newValue: '12',
      expected: {
        href: 'javascript://x:12/',
        port: '12',
      },
    },
  ],
  pathname: [
    {
      comment: 'Cannot-be-a-base don’t have a path',
      href: 'mailto:me@example.net',
      newValue: '/foo',
      expected: {
        href: 'mailto:me@example.net',
        pathname: 'me@example.net',
      },
    },
    {
      href: 'unix:/run/foo.socket?timeout=10',
      newValue: '/var/log/../run/bar.socket',
      expected: {
        href: 'unix:/var/run/bar.socket?timeout=10',
        pathname: '/var/run/bar.socket',
      },
    },
    {
      href: 'https://example.net#nav',
      newValue: 'home',
      expected: {
        href: 'https://example.net/home#nav',
        pathname: '/home',
      },
    },
    {
      href: 'https://example.net#nav',
      newValue: '../home',
      expected: {
        href: 'https://example.net/home#nav',
        pathname: '/home',
      },
    },
    {
      comment: "\\ is a segment delimiter for 'special' URLs",
      href: 'http://example.net/home?lang=fr#nav',
      newValue: '\\a\\%2E\\b\\%2e.\\c',
      expected: {
        href: 'http://example.net/a/c?lang=fr#nav',
        pathname: '/a/c',
      },
    },
    {
      comment: "\\ is *not* a segment delimiter for non-'special' URLs",
      href: 'view-source+http://example.net/home?lang=fr#nav',
      newValue: '\\a\\%2E\\b\\%2e.\\c',
      expected: {
        href: 'view-source+http://example.net/\\a\\%2E\\b\\%2e.\\c?lang=fr#nav',
        pathname: '/\\a\\%2E\\b\\%2e.\\c',
      },
    },
    {
      comment: 'UTF-8 percent encoding with the default encode set. Tabs and newlines are removed.',
      href: 'a:/',
      newValue: "\u0000\u0001\t\n\r\u001f !\"#$%&'()*+,-./09:;<=>?@AZ[\\]^_`az{|}~\u007f\u0080\u0081Éé",
      expected: {
        href: "a:/%00%01%1F%20!%22%23$%&'()*+,-./09:;%3C=%3E%3F@AZ[\\]^_%60az%7B|%7D~%7F%C2%80%C2%81%C3%89%C3%A9",
        pathname: "/%00%01%1F%20!%22%23$%&'()*+,-./09:;%3C=%3E%3F@AZ[\\]^_%60az%7B|%7D~%7F%C2%80%C2%81%C3%89%C3%A9",
      },
    },
    {
      comment: 'Bytes already percent-encoded are left as-is, including %2E outside dotted segments.',
      href: 'http://example.net',
      newValue: '%2e%2E%c3%89té',
      expected: {
        href: 'http://example.net/%2e%2E%c3%89t%C3%A9',
        pathname: '/%2e%2E%c3%89t%C3%A9',
      },
    },
    {
      comment: '? needs to be encoded',
      href: 'http://example.net',
      newValue: '?',
      expected: {
        href: 'http://example.net/%3F',
        pathname: '/%3F',
      },
    },
    {
      comment: '# needs to be encoded',
      href: 'http://example.net',
      newValue: '#',
      expected: {
        href: 'http://example.net/%23',
        pathname: '/%23',
      },
    },
    {
      comment: '? needs to be encoded, non-special scheme',
      href: 'sc://example.net',
      newValue: '?',
      expected: {
        href: 'sc://example.net/%3F',
        pathname: '/%3F',
      },
    },
    {
      comment: '# needs to be encoded, non-special scheme',
      href: 'sc://example.net',
      newValue: '#',
      expected: {
        href: 'sc://example.net/%23',
        pathname: '/%23',
      },
    },
    {
      comment: 'File URLs and (back)slashes',
      href: 'file://monkey/',
      newValue: '\\\\',
      expected: {
        href: 'file://monkey/',
        pathname: '/',
      },
    },
    {
      comment: 'File URLs and (back)slashes',
      href: 'file:///unicorn',
      newValue: '//\\/',
      expected: {
        href: 'file:///',
        pathname: '/',
      },
    },
    {
      comment: 'File URLs and (back)slashes',
      href: 'file:///unicorn',
      newValue: '//monkey/..//',
      expected: {
        href: 'file:///',
        pathname: '/',
      },
    },
  ],
  search: [
    {
      href: 'https://example.net#nav',
      newValue: 'lang=fr',
      expected: {
        href: 'https://example.net/?lang=fr#nav',
        search: '?lang=fr',
      },
    },
    {
      href: 'https://example.net?lang=en-US#nav',
      newValue: 'lang=fr',
      expected: {
        href: 'https://example.net/?lang=fr#nav',
        search: '?lang=fr',
      },
    },
    {
      href: 'https://example.net?lang=en-US#nav',
      newValue: '?lang=fr',
      expected: {
        href: 'https://example.net/?lang=fr#nav',
        search: '?lang=fr',
      },
    },
    {
      href: 'https://example.net?lang=en-US#nav',
      newValue: '??lang=fr',
      expected: {
        href: 'https://example.net/??lang=fr#nav',
        search: '??lang=fr',
      },
    },
    {
      href: 'https://example.net?lang=en-US#nav',
      newValue: '?',
      expected: {
        href: 'https://example.net/?#nav',
        search: '',
      },
    },
    {
      href: 'https://example.net?lang=en-US#nav',
      newValue: '',
      expected: {
        href: 'https://example.net/#nav',
        search: '',
      },
    },
    {
      href: 'https://example.net?lang=en-US',
      newValue: '',
      expected: {
        href: 'https://example.net/',
        search: '',
      },
    },
    {
      href: 'https://example.net',
      newValue: '',
      expected: {
        href: 'https://example.net/',
        search: '',
      },
    },
    /* URI malformed
    {
      comment: 'UTF-8 percent encoding with the query encode set. Tabs and newlines are removed.',
      href: 'a:/',
      newValue: "\u0000\u0001\t\n\r\u001f !\"#$%&'()*+,-./09:;<=>?@AZ[\\]^_`az{|}~\u007f\u0080\u0081Éé",
      expected: {
        href: "a:/?%00%01%1F%20!%22%23$%&'()*+,-./09:;%3C=%3E?@AZ[\\]^_`az{|}~%7F%C2%80%C2%81%C3%89%C3%A9",
        search: "?%00%01%1F%20!%22%23$%&'()*+,-./09:;%3C=%3E?@AZ[\\]^_`az{|}~%7F%C2%80%C2%81%C3%89%C3%A9",
      },
    },
    */
    {
      comment: 'Bytes already percent-encoded are left as-is',
      href: 'http://example.net',
      newValue: '%c3%89té',
      expected: {
        href: 'http://example.net/?%c3%89t%C3%A9',
        search: '?%c3%89t%C3%A9',
      },
    },
  ],
  hash: [
    {
      href: 'https://example.net',
      newValue: 'main',
      expected: {
        href: 'https://example.net/#main',
        hash: '#main',
      },
    },
    {
      href: 'https://example.net#nav',
      newValue: 'main',
      expected: {
        href: 'https://example.net/#main',
        hash: '#main',
      },
    },
    {
      href: 'https://example.net?lang=en-US',
      newValue: '##nav',
      expected: {
        href: 'https://example.net/?lang=en-US##nav',
        hash: '##nav',
      },
    },
    {
      href: 'https://example.net?lang=en-US#nav',
      newValue: '#main',
      expected: {
        href: 'https://example.net/?lang=en-US#main',
        hash: '#main',
      },
    },
    {
      href: 'https://example.net?lang=en-US#nav',
      newValue: '#',
      expected: {
        href: 'https://example.net/?lang=en-US#',
        hash: '',
      },
    },
    {
      href: 'https://example.net?lang=en-US#nav',
      newValue: '',
      expected: {
        href: 'https://example.net/?lang=en-US',
        hash: '',
      },
    },
    {
      href: 'http://example.net',
      newValue: '#foo bar',
      expected: {
        href: 'http://example.net/#foo%20bar',
        hash: '#foo%20bar',
      },
    },
    {
      href: 'http://example.net',
      newValue: '#foo"bar',
      expected: {
        href: 'http://example.net/#foo%22bar',
        hash: '#foo%22bar',
      },
    },
    {
      href: 'http://example.net',
      newValue: '#foo<bar',
      expected: {
        href: 'http://example.net/#foo%3Cbar',
        hash: '#foo%3Cbar',
      },
    },
    {
      href: 'http://example.net',
      newValue: '#foo>bar',
      expected: {
        href: 'http://example.net/#foo%3Ebar',
        hash: '#foo%3Ebar',
      },
    },
    {
      href: 'http://example.net',
      newValue: '#foo`bar',
      expected: {
        href: 'http://example.net/#foo%60bar',
        hash: '#foo%60bar',
      },
    },
    {
      comment: 'Simple percent-encoding; nuls, tabs, and newlines are removed',
      href: 'a:/',
      newValue: "\u0000\u0001\t\n\r\u001f !\"#$%&'()*+,-./09:;<=>?@AZ[\\]^_`az{|}~\u007f\u0080\u0081Éé",
      expected: {
        href: "a:/#%01%1F%20!%22#$%&'()*+,-./09:;%3C=%3E?@AZ[\\]^_%60az{|}~%7F%C2%80%C2%81%C3%89%C3%A9",
        hash: "#%01%1F%20!%22#$%&'()*+,-./09:;%3C=%3E?@AZ[\\]^_%60az{|}~%7F%C2%80%C2%81%C3%89%C3%A9",
      },
    },
    {
      comment: 'Bytes already percent-encoded are left as-is',
      href: 'http://example.net',
      newValue: '%c3%89té',
      expected: {
        href: 'http://example.net/#%c3%89t%C3%A9',
        hash: '#%c3%89t%C3%A9',
      },
    },
    {
      href: 'javascript:alert(1)',
      newValue: 'castle',
      expected: {
        href: 'javascript:alert(1)#castle',
        hash: '#castle',
      },
    },
  ],
};
