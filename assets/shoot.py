"""Screenshot a live site with the cookie / tour overlays dismissed first.

Plain `chrome --screenshot` can't click, so tours and consent modals end up baked into
the capture. This drives headless Chrome over the DevTools protocol instead: load, let it
settle, strip anything that reads as a blocking overlay, then grab the frame.

    python shoot.py <url> <out.png> [wait_ms] [--gentle]
"""
import base64, json, os, subprocess, sys, tempfile, time
import urllib.request
import websocket

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 9333

# kills tour modals, consent banners and their scrim — anything fixed/sticky that covers
# a big slice of the viewport, plus the usual suspects by name
STRIP = r"""
(() => {
  const vw = innerWidth, vh = innerHeight, area = vw * vh;
  // click an explicit dismiss first — that is gentler than ripping the node out
  // BhashaBuddy's tour drives itself through five routes and one of them throws, so a
  // click here can leave you photographing an error page. GENTLE skips the clicking and
  // only lifts the overlay out.
  if (!window.__GENTLE__) {
    const words = /skip|dismiss|no thanks|not now|close|accept|got it|continue|explore on my own/i;
    for (const el of document.querySelectorAll('button,a,[role=button]')) {
      if (words.test((el.textContent || '').trim()) && el.offsetParent) { try { el.click(); } catch {} }
    }
  }
  for (const el of [...document.querySelectorAll('body *')]) {
    const s = getComputedStyle(el);
    if (s.position !== 'fixed' && s.position !== 'sticky') continue;
    const r = el.getBoundingClientRect();
    if (r.width * r.height > area * 0.22 && r.top < vh * 0.9) el.remove();
  }
  // un-dim whatever the scrim left behind
  for (const el of document.querySelectorAll('body,main,#root,#__next')) {
    el.style.filter = 'none'; el.style.opacity = '1'; el.style.overflow = 'visible';
  }
  document.body.style.overflow = 'visible';
  return document.title;
})()
"""


def cdp(ws, mid, method, params=None):
    ws.send(json.dumps({"id": mid, "method": method, "params": params or {}}))
    while True:
        msg = json.loads(ws.recv())
        if msg.get("id") == mid:
            return msg.get("result", {})


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    gentle = "--gentle" in sys.argv
    url, out = args[0], args[1]
    wait = int(args[2]) if len(args) > 2 else 6000

    profile = tempfile.mkdtemp()
    proc = subprocess.Popen(
        [CHROME, "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         f"--remote-debugging-port={PORT}", f"--user-data-dir={profile}", "--remote-allow-origins=*",
         "--window-size=1440,900", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        endpoint = None
        for _ in range(60):                      # wait for the debugger to come up
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json"))
                page = next(t for t in tabs if t["type"] == "page")
                endpoint = page["webSocketDebuggerUrl"]
                break
            except Exception:
                time.sleep(0.25)
        if not endpoint:
            raise SystemExit("chrome debugger never came up")

        ws = websocket.create_connection(endpoint, timeout=60)
        cdp(ws, 1, "Page.enable")
        cdp(ws, 2, "Runtime.enable")
        cdp(ws, 3, "Emulation.setDeviceMetricsOverride",
            {"width": 1440, "height": 900, "deviceScaleFactor": 2, "mobile": False})
        cdp(ws, 4, "Page.navigate", {"url": url})
        time.sleep(wait / 1000)
        if gentle:
            cdp(ws, 45, "Runtime.evaluate",
                {"expression": "window.__GENTLE__ = true", "returnByValue": True})
        cdp(ws, 5, "Runtime.evaluate", {"expression": STRIP, "returnByValue": True})
        time.sleep(1.2)                          # let layout settle after the strip
        shot = cdp(ws, 6, "Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
        data = base64.b64decode(shot["data"])
        with open(out, "wb") as f:
            f.write(data)
        print(f"OK  {os.path.basename(out)}  {len(data)//1024} KB")
        ws.close()
    finally:
        proc.terminate()


if __name__ == "__main__":
    main()
