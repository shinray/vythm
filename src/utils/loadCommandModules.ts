import fs from 'fs';
import path from 'path';

const loadCommandModules = (dirPath: string, accumulator?: any[]): any[] => {
    const files = fs.readdirSync(dirPath);
    let fileArray = accumulator ? [...accumulator] : [];

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            fileArray = loadCommandModules(filePath, fileArray);
        } else if (accumulator) {
            fileArray.push(filePath);
        }
    });

    return fileArray.filter((file) => file.endsWith('.js'));
};

export default loadCommandModules;
