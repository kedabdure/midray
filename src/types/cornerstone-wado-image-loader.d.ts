declare module 'cornerstone-wado-image-loader' {
  export const external: {
    cornerstone?: any;
    dicomParser?: any;
  };

  export function configure(options: {
    useWebWorkers?: boolean;
    decodeConfig?: any;
  }): void;

  export namespace wadouri {
    export namespace fileManager {
      export function add(blob: Blob): string;
    }
  }
}
