import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(__dirname, "..");

// `/` serves the current redesign; `/v3/` keeps the previous prototype reachable.
const roots = [
  { prefix: "/v3", dir: path.join(repo, "prototype") },
  { prefix: "", dir: path.join(repo, "site") },
];

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(url.pathname);

    const mount = roots.find((r) => r.prefix === "" || pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
    const root = mount.dir;
    pathname = pathname.slice(mount.prefix.length) || "/";
    if (pathname.endsWith("/")) pathname += "index.html";

    const filePath = path.normalize(path.join(root, pathname));
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404).end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400",
    });
    fs.createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(500).end("Server error");
  }
});

server.listen(port, host, () => {
  console.log(`OWNED site on http://${host}:${port}  ·  previous prototype at /v3/`);
});
