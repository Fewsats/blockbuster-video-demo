import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { schnorr } from '@noble/curves/secp256k1'
import { bytesToHex } from '@noble/hashes/utils'
import { sha256 } from '@noble/hashes/sha256'

// Generate demo pubKey and secretKey
export function generateKeys(): {
    secretKey: Uint8Array;
    pubKey: string;
} {
    const sk = generateSecretKey() // `sk` is a Uint8Array
    const pk = getPublicKey(sk) 
    return { secretKey: sk, pubKey: pk }
}


export async function signMessage(secretKey: Uint8Array, message: string): Promise<string> {
    const hash = sha256(message)
    const messageHash = bytesToHex(hash)

    const sig = bytesToHex(schnorr.sign(messageHash, secretKey))

  return sig
}