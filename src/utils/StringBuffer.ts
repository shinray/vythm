export default class StringBuffer {
    private lines: string[] = [];

    private totalChars: number = 0;

    private readonly maxChars: number;

    constructor(maxChars: number) {
        this.maxChars = maxChars;
    }

    addLine(line: string): void {
        const lineLength = line.length + 1;
        this.totalChars += lineLength;
        this.lines.push(line);

        while (this.totalChars > this.maxChars && this.lines.length > 0) {
            const removedLine = this.lines.shift();
            if (removedLine) {
                this.totalChars -= removedLine.length + 1;
            }
        }
    }

    toString(): string {
        return this.lines.join('\n');
    }
}
