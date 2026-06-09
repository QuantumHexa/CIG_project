import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDir = path.resolve(__dirname, "../models");
const BASE =
  "https://raw.githubusercontent.com/vladmandic/face-api/master/model";

const files = [
  "ssd_mobilenetv1_model-weights_manifest.json",
  "ssd_mobilenetv1_model-shard1",
  "ssd_mobilenetv1_model-shard2",
  "face_landmark_68_model-weights_manifest.json",
  "face_landmark_68_model-shard1",
  "face_recognition_model-weights_manifest.json",
  "face_recognition_model-shard1",
  "face_recognition_model-shard2",
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 302 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
      })
      .on("error", reject);
  });
}

async function main() {
  fs.mkdirSync(modelsDir, { recursive: true });
  for (const f of files) {
    const dest = path.join(modelsDir, f);
    if (fs.existsSync(dest)) {
      console.log("skip", f);
      continue;
    }
    console.log("download", f);
    await download(`${BASE}/${f}`, dest);
  }
  console.log("Face models ready in", modelsDir);
}

main().catch(console.error);
