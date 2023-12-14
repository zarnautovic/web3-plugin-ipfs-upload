import * as fs from "fs";

export class Utils {
  static getDirName(): string {
    const dirUrl = new URL("../../", import.meta.url);
    return dirUrl.pathname;
  }

  static isServer(): boolean {
    return !(typeof window != "undefined" && window.document);
  }

  static readFile(filePath: string): Uint8Array {
    const __dirname = Utils.getDirName();
    const file = fs.readFileSync(String(`${__dirname}${filePath}`), "utf-8");
    const bytes = new TextEncoder().encode(file);
    return bytes;
  }
}
