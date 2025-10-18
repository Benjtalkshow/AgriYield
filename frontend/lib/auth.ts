import { Magic } from "magic-sdk";

const createMagic = () => {
  return typeof window !== "undefined"
    ? new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!)
    : null;
};

export const magic = createMagic();
