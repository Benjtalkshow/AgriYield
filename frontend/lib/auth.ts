import { Magic } from "magic-sdk";

const createMagic = () => {
  return typeof window !== "undefined"
    ? new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!)
    : null;
};

export const magic = createMagic();

let magic_sdk: Magic | null = null

export const initializeMagic = async (): Promise<Magic | null> => {
  if (typeof window === "undefined") return null
  if (magic) return magic

  try {
    const magicKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY
    if (!magicKey) {
      console.error(" Magic publishable key not found")
      return null
    }

    magic_sdk = new Magic(magicKey, {
      network: {
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
        chainId: Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID!),
      },
    })
    return magic_sdk
  } catch (error) {
    console.error(" Failed to initialize Magic:", error)
    return null
  }
}