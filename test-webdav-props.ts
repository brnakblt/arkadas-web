
import { createClient } from "webdav";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function test() {
    const client = createClient(
        "http://localhost:8080/remote.php/dav/files/admin/",
        {
            username: "admin",
            password: process.env.NEXTCLOUD_PASSWORD
        }
    );

    console.log("Fetching directory contents...");
    // Try to get custom props
    const contents = await client.getDirectoryContents("/", {
        details: true,
        data: `<?xml version="1.0"?>
            <d:propfind  xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
                <d:prop>
                    <d:getlastmodified />
                    <d:getcontentlength />
                    <d:resourcetype />
                    <d:displayname />
                    <oc:fileid />
                </d:prop>
            </d:propfind>`
    });

    console.log("Contents:", JSON.stringify(contents, null, 2));
}

test();
