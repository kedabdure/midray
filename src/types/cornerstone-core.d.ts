declare module 'cornerstone-core' {
  export function enable(element: HTMLElement): void;
  export function disable(element: HTMLElement): void;
  export function displayImage(element: HTMLElement, image: any): void;
  export function loadImage(imageId: string): Promise<any>;
  export function getDefaultViewportForImage(element: HTMLElement, image: any): any;
  export function setViewport(element: HTMLElement, viewport: any): void;
  export const external: {
    cornerstone?: any;
  };
}
