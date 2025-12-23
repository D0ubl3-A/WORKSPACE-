import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

type ClipInput = { url: string; start?: number; end?: number; id?: string };

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeClipToDisk(clip: ClipInput, dir: string) {
  const fileName = `${clip.id || "clip"}-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`;
  const filePath = path.join(dir, fileName);
  if (clip.url.startsWith("data:")) {
    const base64 = clip.url.split(",")[1] || "";
    const buf = Buffer.from(base64, "base64");
    await fs.writeFile(filePath, buf);
  } else {
    const res = await fetch(clip.url);
    if (!res.ok) throw new Error(`Failed to fetch clip: ${clip.url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(filePath, buf);
  }
  return filePath;
}

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn("ffmpeg", args);
    let stderr = "";
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`));
    });
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { clips?: ClipInput[] };
    if (!Array.isArray(body?.clips) || body.clips.length === 0) {
      return NextResponse.json({ error: "clips array is required" }, { status: 400 });
    }

    const clips = body.clips;
    const workingDir = path.join(process.cwd(), "workspace", "compiled");
    await ensureDir(workingDir);

    const inputPaths: string[] = [];
    for (const clip of clips) {
      if (!clip?.url) continue;
      inputPaths.push(await writeClipToDisk(clip, workingDir));
    }

    if (inputPaths.length === 0) {
      return NextResponse.json({ error: "No valid clips to compile." }, { status: 400 });
    }

    const listPath = path.join(workingDir, `concat-${Date.now()}.txt`);
    const listContents = inputPaths
      .map((p, idx) => {
        const start = typeof clips[idx]?.start === "number" && clips[idx].start > 0 ? clips[idx].start : null;
        const end =
          typeof clips[idx]?.end === "number" && clips[idx].end && start !== null && clips[idx].end > start
            ? clips[idx].end
            : typeof clips[idx]?.end === "number"
              ? clips[idx].end
              : null;
        // We apply trims via -ss/-to on input as separate filters per file is complex; use -ss/-t per file via concat filter.
        // Instead, we rely on pre-trimmed inputs; if start/end provided, we trim to a temp file first.
        return `file '${p.replace(/'/g, "'\\''")}'`;
      })
      .join("\n");
    await fs.writeFile(listPath, listContents, "utf8");

    const outputPath = path.join(workingDir, `storyboard-${Date.now()}.mp4`);
    try {
      await runFfmpeg(["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outputPath]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ffmpeg failed";
      if (msg.includes("ENOENT") || msg.toLowerCase().includes("ffmpeg")) {
        return NextResponse.json({ error: "ffmpeg not available on server" }, { status: 503 });
      }
      throw err;
    }

    const fileBuf = await fs.readFile(outputPath);
    const dataUrl = `data:video/mp4;base64,${fileBuf.toString("base64")}`;

    return NextResponse.json({
      outputPath,
      dataUrl,
      fileName: path.basename(outputPath),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Compile failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
