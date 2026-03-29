
const { createClient } = require("webdav");
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env.local');
const envConfig = {};
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envConfig[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
}

const ARKADAS_URL = envConfig.NEXT_PUBLIC_ARKADAS_URL || "http://localhost:8080";
const ARKADAS_USER = envConfig.ARKADAS_USER || "admin";
const ARKADAS_PASSWORD = envConfig.ARKADAS_PASSWORD || "admin";

const client = createClient(`${ARKADAS_URL}/remote.php/dav/files/${ARKADAS_USER}/`, {
    username: ARKADAS_USER,
    password: ARKADAS_PASSWORD
});

async function run() {
    try {
        await client.createDirectory("/ArkadasUsers");
    } catch (e) {}
    try {
        await client.createDirectory(`/ArkadasUsers/${ARKADAS_USER}`);
    } catch (e) {}

    const buffer = Buffer.from("Test content for DOCX");
    await client.putFileContents(`/ArkadasUsers/${ARKADAS_USER}/test-document.docx`, buffer);
    console.log("Uploaded test-document.docx");
}

run();
