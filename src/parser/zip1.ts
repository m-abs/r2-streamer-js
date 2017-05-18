import * as debug_ from "debug";
import * as StreamZip from "node-stream-zip";

import { RangeStream } from "./RangeStream";
import { IStreamAndLength, IZip } from "./zip";

// import { bufferToStream } from "../utils";

const debug = debug_("r2:zip1");

export class Zip1 implements IZip {

    public static loadPromise(filePath: string): Promise<IZip> {

        return new Promise<IZip>((resolve, reject) => {

            const zip = new StreamZip({
                file: filePath,
                storeEntries: true,
            });

            zip.on("error", (err: any) => {
                debug("--ZIP error:");
                debug(err);

                reject(err);
            });

            zip.on("entry", (_entry: any) => {
                // console.log("--ZIP: entry");
                // debug(entry.name);
            });

            zip.on("extract", (entry: any, file: any) => {
                debug("--ZIP extract:");
                debug(entry.name);
                debug(file);
            });

            zip.on("ready", () => {
                // console.log("--ZIP: ready");
                // console.log(zip.entriesCount);

                // const entries = zip.entries();
                // console.log(entries);

                resolve(new Zip1(filePath, zip));
            });
        });
    }

    private constructor(readonly filePath: string, readonly zip: any) {
    }

    public hasEntries(): boolean {
        return this.zip.entriesCount > 0;
    }

    public hasEntry(entryPath: string): boolean {
        return this.hasEntries()
            && Object.keys(this.zip.entries()).indexOf(entryPath) >= 0;
    }

    public forEachEntry(callback: (entryName: string) => void) {

        if (!this.hasEntries()) {
            return;
        }

        const entries = this.zip.entries();
        Object.keys(entries).forEach((entryName) => {
            callback(entryName);
        });
    }

    public entryStreamPromise(entryPath: string): Promise<IStreamAndLength> {

        // debug(`entryStreamPromise: ${entryPath}`);

        if (!this.hasEntries() || !this.hasEntry(entryPath)) {
            return Promise.reject("no such path in zip");
        }

        // return new Promise<IStreamAndLength>((resolve, _reject) => {
        //     const buffer: Buffer = this.zip.entryDataSync(entryPath);
        //     const streamAndLength: IStreamAndLength = {
        //         length: buffer.length,
        //         stream: bufferToStream(buffer),
        //     };
        //     resolve(streamAndLength);
        // });

        return new Promise<IStreamAndLength>((resolve, reject) => {

            this.zip.stream(entryPath, (err: any, stream: NodeJS.ReadableStream) => {
                if (err) {
                    reject(err);
                    return;
                }

                const entry = this.zip.entries()[entryPath];

                const streamAndLength: IStreamAndLength = {
                    stream,
                    length: entry.size,
                };
                resolve(streamAndLength);
            });
        });
    }

    public entryStreamRangePromise(entryPath: string, begin: number, end: number): Promise<IStreamAndLength> {

        return new Promise<IStreamAndLength>((resolve, reject) => {
            this.entryStreamPromise(entryPath)
                .then((streamAndLength) => {

                    const b = begin < 0 ? 0 : begin;
                    const e = end < 0 ? (streamAndLength.length - 1) : end;
                    // const length = e - b + 1;
                    debug(`entryStreamRangePromise: ${b}-${e}/${streamAndLength.length}`);

                    const stream = new RangeStream(b, e, streamAndLength.length);

                    streamAndLength.stream.pipe(stream);

                    const sal: IStreamAndLength = {
                        stream,
                        length: streamAndLength.length,
                    };
                    resolve(sal);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
}