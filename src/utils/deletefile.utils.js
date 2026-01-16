import fs from 'fs/promises';


const deleteFile = async (fullPath) => {
    try {
        await fs.unlink(fullPath);
        console.log(`File deleted successfully: ${fullPath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File not found: ${fullPath}`);
        } else {
            console.error(`Error deleting file ${fullPath}:`, error.message);
            throw error;
        }
    }
}

export { deleteFile };