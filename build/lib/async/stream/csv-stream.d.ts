import { IStream } from './stream';
export declare class CsvStream implements IStream {
    private loaded;
    private error;
    private csvParser;
    private done;
    private columnNames?;
    private columnNamesRead;
    private nextResolve;
    private nextReject;
    private columnsResolve;
    private columnsReject;
    private satisfyColumnNamesPromise();
    private unloadRow();
    private raiseError(err);
    constructor(inputFilePath: string, config?: any);
    getColumnNames(): Promise<string[]>;
    read(): Promise<IteratorResult<any>>;
}