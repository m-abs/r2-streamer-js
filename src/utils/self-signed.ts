// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as crypto from "crypto";
import * as selfsigned from "selfsigned";
import * as uuid from "uuid";

export interface CertificateData {
    trustKey: Buffer;
    trustCheck: string;
    trustCheckIV: Buffer;

    // clientprivate?: string;
    // clientpublic?: string;
    // clientcert?: string;

    private?: string; // https.ServerOptions.key
    public?: string;
    cert?: string; // https.ServerOptions.cert
}

export async function generateSelfSignedData(): Promise<CertificateData> {
    return new Promise<CertificateData>((resolve, reject) => {
        const opts = {
            algorithm: "sha256",
            // clientCertificate: true,
            // clientCertificateCN: "R2 insecure client",
            days: 30,
            extensions: [{
                altNames: [{
                    type: 2, // DNSName
                    value: "localhost",
                }],
                name: "subjectAltName",
            }],
        };
        const rand = uuid.v4();
        const attributes = [{ name: "commonName", value: "R2 insecure server " + rand }];

        selfsigned.generate(attributes, opts, (err: any, keys: any) => {
            if (err) {
                reject(err);
                return;
            }

            const password = uuid.v4();
            // const checkSum = crypto.createHash("sha256");
            // checkSum.update(password);
            // const hash = checkSum.digest("hex").toUpperCase();
            const salt = crypto.randomBytes(16).toString("hex");
            const hash = crypto.pbkdf2Sync(password, salt, 1000, 32, "sha256").toString("hex");
            (keys as CertificateData).trustKey = new Buffer(hash, "hex");

            (keys as CertificateData).trustCheck = uuid.v4();

            const AES_BLOCK_SIZE = 16;
            const ivBuff = new Buffer(uuid.v4());
            const iv = ivBuff.slice(0, AES_BLOCK_SIZE);
            (keys as CertificateData).trustCheckIV = iv;

            resolve(keys as CertificateData);
        });
    });
}
