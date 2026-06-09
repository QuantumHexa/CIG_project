import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load backend/.env first (correct cwd for Prisma SQLite paths)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
// Optional root overrides (non-database vars only)
dotenv.config({ path: path.resolve(__dirname, "../../../.env"), override: false });

const clientUrls = (process.env.CLIENT_URL ?? "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientUrl: clientUrls[0] ?? "http://localhost:5173",
  clientUrls,
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  databaseUrl: process.env.DATABASE_URL ?? "",
  aws: {
    region: process.env.AWS_REGION ?? "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.AWS_S3_BUCKET ?? "",
  },
  hfToken: process.env.HF_API_TOKEN ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
};

export const useS3 = Boolean(
  env.aws.bucket && env.aws.accessKeyId && env.aws.secretAccessKey
);
