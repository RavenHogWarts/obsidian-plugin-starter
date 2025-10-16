import dotenv from "dotenv";
import { existsSync } from "fs";
import { copyFile, mkdir, readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginDir = join(__dirname, "..");

dotenv.config({ quiet: true });
const VAULT_PATH = process.env.VAULT_PATH;
if (!VAULT_PATH) {
	throw new Error(
		"VAULT_PATH is not defined. Please create a .env file in the project root and add the line: VAULT_PATH=/path/to/your/vault"
	);
}

const fileConfig = [
	{
		name: "manifest.json",
		sourcePath: pluginDir,
	},
	{
		name: "main.js",
		sourcePath: pluginDir,
	},
	{
		name: "styles.css",
		sourcePath: pluginDir,
	},
];

const manifestPath = join(projectRootDir, "manifest.json");

async function copyToVault() {
	try {
		const manifestContent = await readFile(manifestPath, "utf8");
		const manifest = JSON.parse(manifestContent);
		const pluginId = manifest.id;

		const targetPluginDir = join(
			VAULT_PATH,
			".obsidian",
			"plugins",
			pluginId
		);

		if (!existsSync(targetPluginDir)) {
			await mkdir(targetPluginDir, { recursive: true });
			console.log(`创建目录: ${targetPluginDir}`);
		}

		// 复制文件
		for (const fileInfo of fileConfig) {
			const sourcePath = join(fileInfo.sourcePath, fileInfo.name);
			const destPath = join(targetPluginDir, fileInfo.name);
			await copyFile(sourcePath, destPath);
			console.log(`复制文件: ${fileInfo.name} -> ${destPath}`);
		}
	} catch (error) {
		console.error("复制文件时出错:", error);
		process.exit(1);
	}
}

copyToVault();
