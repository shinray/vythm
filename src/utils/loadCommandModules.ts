import fs from 'fs';
import path from 'path';

/**
 * Recursively lists all files in a given directory
 * @param {string} dirPath a path to a directory to search
 * @param {string[]} accumulator accumulates filepaths while recursing
 * @returns {string[]} a list of paths to files in dirPath and subdirs
 */
const loadCommandModules = (
    dirPath: string,
    accumulator?: string[],
): string[] => {
    const files = fs.readdirSync(dirPath);
    console.debug('files', files);
    let fileArray = accumulator ? [...accumulator] : [];

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            // TODO: test that this actually recurses properly
            fileArray = loadCommandModules(filePath, fileArray);
        } else {
            fileArray.push(filePath);
        }
    });

    return fileArray.filter(
        (file) => file.endsWith('.js') || file.endsWith('.ts'),
    );
};

export default loadCommandModules;
