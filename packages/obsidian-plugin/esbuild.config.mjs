import { copyFile, mkdir } from "node:fs/promises";
import process from "node:process";
import esbuild from "esbuild";

const mode = process.argv[2] ?? "production";
const isProduction = mode === "production";
const shouldWatch = process.argv.includes("--watch");
const testVaultPluginDir = process.env.OBSIDIAN_TEST_VAULT
  ? `${process.env.OBSIDIAN_TEST_VAULT}/.obsidian/plugins/ai-literary-assistant`
  : undefined;
const outputDir = testVaultPluginDir ?? "dist";

const copyPluginFiles = async () => {
  await mkdir(outputDir, { recursive: true });
  await copyFile("manifest.json", `${outputDir}/manifest.json`);
};

const buildOptions = {
  bundle: true,
  entryPoints: ["src/main.ts"],
  external: ["obsidian"],
  format: "cjs",
  logLevel: "info",
  loader: {
    ".md": "text"
  },
  minify: isProduction,
  outfile: `${outputDir}/main.js`,
  platform: "browser",
  sourcemap: !isProduction,
  target: "es2022",
  treeShaking: true
};

const cssBuildOptions = {
  bundle: true,
  entryPoints: ["src/ui/styles/index.css"],
  logLevel: "info",
  minify: isProduction,
  outfile: `${outputDir}/styles.css`,
  sourcemap: !isProduction
};

await copyPluginFiles();

if (shouldWatch) {
  const context = await esbuild.context({
    ...buildOptions,
    plugins: [
      {
        name: "copy-plugin-files",
        setup: (build) => {
          build.onEnd(async () => {
            await copyPluginFiles();
          });
        }
      }
    ]
  });
  const cssContext = await esbuild.context(cssBuildOptions);

  await context.watch();
  await cssContext.watch();
  console.log(`Watching plugin files and writing JS/CSS builds to ${outputDir}`);
} else {
  await Promise.all([
    esbuild.build(buildOptions),
    esbuild.build(cssBuildOptions)
  ]);
}
