import fs from 'fs';
import path from 'path';

const loadCommandModules = (dirPath: string, accumulator?: any[]): any[] => {
    const files = fs.readdirSync(dirPath);
    console.debug('files', files);
    let fileArray = accumulator ? [...accumulator] : [];

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        console.debug('filepath', filePath);
        if (fs.statSync(filePath).isDirectory()) {
            fileArray = loadCommandModules(filePath, fileArray);
        } else {
            fileArray.push(filePath);
        }
    });

    console.debug('fileArray', fileArray);

    return fileArray.filter((file) => file.endsWith('.js'));
};

export default loadCommandModules;
