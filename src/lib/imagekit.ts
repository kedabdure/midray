/**
 * ImageKit Node.js SDK singleton.
 * This module is SERVER-ONLY — never import into client components.
 * The private key must never be exposed to the browser.
 */
import ImageKit from "imagekit";

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
  throw new Error("Missing env var: IMAGEKIT_PRIVATE_KEY");
}
if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) {
  throw new Error("Missing env var: NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY");
}
if (!process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
  throw new Error("Missing env var: NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT");
}

export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});
