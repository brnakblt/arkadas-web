import { betterAuth } from "better-auth";
import mysql from "mysql2/promise";

// Create a connection pool to the MariaDB database
// Note: In development (outside Docker), we access via localhost:3306 (if exposed) or the container IP.
// Since we didn't expose port 3306 in docker-compose.yml, we need to update it to expose the port for local dev access.
// For now, let's assume we will expose it.

export const auth = betterAuth({
    database: {
        provider: "mysql",
        // Connection details for the Nextcloud MariaDB
        // We will need to update docker-compose to expose port 3306 to localhost
        url: "mysql://nextcloud:admin@127.0.0.1:3306/nextcloud", 
    },
    emailAndPassword: {
        enabled: true,
    },
    // We can add social providers here later
});
