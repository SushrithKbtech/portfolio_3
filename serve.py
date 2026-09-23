"""Dev server for sk-folio.

Two things the stdlib default gets wrong for this job:

  • `python -m http.server` sends no Cache-Control, so the browser applies heuristic
    freshness and serves the PREVIOUS build after you edit a file. Everything here is
    sent no-store.
  • A plain single-threaded TCPServer blocks on one held-open connection, and a browser
    holding a keep-alive socket then stalls every other request. ThreadingHTTPServer
    handles each connection on its own thread.

    python serve.py [port]
"""
import http.server
import os
import sys
import threading

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5183
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"          # safe now that each connection has a thread

    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
        ".svg": "image/svg+xml",
        ".json": "application/json",
        ".woff2": "font/woff2",
        ".pdf": "application/pdf",
    }

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        try:
            line = fmt % args
        except Exception:
            return
        if " 404 " in line or " 500 " in line:     # only surface what is actually missing
            sys.stderr.write("%s\n" % line)
            sys.stderr.flush()


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    httpd = Server(("127.0.0.1", PORT), Handler)
    print("sk-folio on http://localhost:%d (no-cache, threaded)" % PORT, flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
