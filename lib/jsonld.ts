// JSON-LD'yi <script> içine güvenli gömmek için: '<' karakterini kaçırır,
// böylece DB içeriğinde </script> geçse bile script'ten kaçış olmaz (XSS önlemi).
export function ldScript(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
