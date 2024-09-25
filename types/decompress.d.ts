declare module '@xhmikosr/decompress' {
  interface DecompressOptions {
    filter?: (file: DecompressFile) => boolean;
    map?: (file: DecompressFile) => DecompressFile;
    plugins?: Array<any>; // Customize this if you know the plugins' types
    strip?: number;
  }

  interface DecompressFile {
    path: string;
    data: Buffer;
    type: string;  // E.g., 'file' or 'directory'
    mode: number;
    mtime?: Date;
  }

  function decompress(
    input: string | Buffer, // Can be a path or a buffer
    output?: string, // Destination path
    options?: DecompressOptions
  ): Promise<DecompressFile[]>;

  export = decompress;
}

declare module '@xhmikosr/decompress-targz' {
  interface DecompressTargzOptions {
    strip?: number;
  }

  function decompressTargz(): any;

  export = decompressTargz;
}
