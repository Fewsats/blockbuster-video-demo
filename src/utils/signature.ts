import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { schnorr } from '@noble/curves/secp256k1'
import { bytesToHex } from '@noble/hashes/utils'
import { sha256 } from '@noble/hashes/sha256'

export async function generateKeysAndSignature(domain: string, timestamp: number): Promise<{
  pubKeyHex: string;
  signatureHex: string;
  message: string;
}> {
    const sk = generateSecretKey() // `sk` is a Uint8Array
    const pk = getPublicKey(sk) 

    
    const message = `${domain}:${timestamp}`
    const hash = sha256(message)
    const messageHash = bytesToHex(hash)

    const sig = bytesToHex(schnorr.sign(messageHash, sk))

  return { pubKeyHex: pk, signatureHex: sig, message }
}