import path from "node:path";

export const PROJECT_PATHS = {
  rootDir: path.resolve(__dirname, "..", ".."),
  fixturesDir: path.resolve(__dirname, "..", "..", "fixtures"),
  pdfFixturesDir: path.resolve(__dirname, "..", "..", "fixtures", "pdf"),
  datasetsDir: path.resolve(__dirname, "..", "..", "fixtures", "datasets"),
} as const;
