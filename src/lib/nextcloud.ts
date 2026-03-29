/**
 * Arkadaş WebDAV Client Utility
 * Provides file operations through Arkadaş's WebDAV API
 */

import { createClient, WebDAVClient, FileStat } from 'webdav';

const ARKADAS_URL = process.env.ARKADAS_URL || 'http://localhost:8080';
const ARKADAS_ADMIN_USER = process.env.ARKADAS_ADMIN_USER || 'admin';
const ARKADAS_ADMIN_PASSWORD = process.env.ARKADAS_ADMIN_PASSWORD || '';

export interface ArkadaşFile {
    filename: string;
    basename: string;
    type: 'file' | 'directory';
    size: number;
    lastmod: string;
    mime?: string;
    etag?: string;
}

export interface UploadOptions {
    overwrite?: boolean;
    contentType?: string;
}

/**
 * Create a Arkadaş WebDAV client for a specific user
 */
export const createArkadaşClient = (username?: string, password?: string): WebDAVClient => {
    const user = username || ARKADAS_ADMIN_USER;
    const pass = password || ARKADAS_ADMIN_PASSWORD;

    return createClient(`${ARKADAS_URL}/remote.php/dav/files/${user}`, {
        username: user,
        password: pass,
    });
};

/**
 * Create admin client for system operations
 */
export const getAdminClient = (): WebDAVClient => {
    return createClient(`${ARKADAS_URL}/remote.php/dav/files/${ARKADAS_ADMIN_USER}`, {
        username: ARKADAS_ADMIN_USER,
        password: ARKADAS_ADMIN_PASSWORD,
    });
};

/**
 * List files in a directory
 */
export const listFiles = async (
    client: WebDAVClient,
    path: string = '/'
): Promise<ArkadaşFile[]> => {
    try {
        const contents = await client.getDirectoryContents(path) as FileStat[];

        return contents.map((item) => ({
            filename: item.filename,
            basename: item.basename,
            type: item.type as 'file' | 'directory',
            size: item.size,
            lastmod: item.lastmod,
            mime: item.mime,
            etag: item.etag ?? undefined,
        }));
    } catch (error) {
        console.error('Error listing files:', error);
        throw new Error('Failed to list files from Arkadaş');
    }
};

/**
 * Upload a file to Arkadaş
 */
export const uploadFile = async (
    client: WebDAVClient,
    remotePath: string,
    content: Buffer | ArrayBuffer | string,
    options: UploadOptions = {}
): Promise<boolean> => {
    try {
        await client.putFileContents(remotePath, content, {
            overwrite: options.overwrite ?? true,
            contentLength: content instanceof Buffer ? content.length : undefined,
        });
        return true;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file to Arkadaş');
    }
};

/**
 * Download a file from Arkadaş
 */
export const downloadFile = async (
    client: WebDAVClient,
    remotePath: string
): Promise<Buffer> => {
    try {
        const content = await client.getFileContents(remotePath) as Buffer;
        return content;
    } catch (error) {
        console.error('Error downloading file:', error);
        throw new Error('Failed to download file from Arkadaş');
    }
};

/**
 * Delete a file or directory
 */
export const deleteFile = async (
    client: WebDAVClient,
    remotePath: string
): Promise<boolean> => {
    try {
        await client.deleteFile(remotePath);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw new Error('Failed to delete file from Arkadaş');
    }
};

/**
 * Create a directory
 */
export const createDirectory = async (
    client: WebDAVClient,
    remotePath: string
): Promise<boolean> => {
    try {
        await client.createDirectory(remotePath, { recursive: true });
        return true;
    } catch (error) {
        console.error('Error creating directory:', error);
        throw new Error('Failed to create directory in Arkadaş');
    }
};

/**
 * Check if file/directory exists
 */
export const exists = async (
    client: WebDAVClient,
    remotePath: string
): Promise<boolean> => {
    try {
        return await client.exists(remotePath);
    } catch {
        return false;
    }
};

/**
 * Get file info
 */
export const getFileInfo = async (
    client: WebDAVClient,
    remotePath: string
): Promise<ArkadaşFile | null> => {
    try {
        const stat = await client.stat(remotePath) as FileStat;
        return {
            filename: stat.filename,
            basename: stat.basename,
            type: stat.type as 'file' | 'directory',
            size: stat.size,
            lastmod: stat.lastmod,
            mime: stat.mime,
            etag: stat.etag ?? undefined,
        };
    } catch {
        return null;
    }
};

/**
 * Move/rename a file
 */
export const moveFile = async (
    client: WebDAVClient,
    fromPath: string,
    toPath: string
): Promise<boolean> => {
    try {
        await client.moveFile(fromPath, toPath);
        return true;
    } catch (error) {
        console.error('Error moving file:', error);
        throw new Error('Failed to move file in Arkadaş');
    }
};

/**
 * Copy a file
 */
export const copyFile = async (
    client: WebDAVClient,
    fromPath: string,
    toPath: string
): Promise<boolean> => {
    try {
        await client.copyFile(fromPath, toPath);
        return true;
    } catch (error) {
        console.error('Error copying file:', error);
        throw new Error('Failed to copy file in Arkadaş');
    }
};

export default {
    createArkadaşClient,
    getAdminClient,
    listFiles,
    uploadFile,
    downloadFile,
    deleteFile,
    createDirectory,
    exists,
    getFileInfo,
    moveFile,
    copyFile,
};
