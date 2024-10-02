import { useState, useCallback } from 'react';
import { VideoInfo } from '../types';
import { extractPaymentHash, fetchL402Video, handleL402URIScheme, makeStreamVideoRequest} from '../utils/l402';
import { L402CredentialManager } from '../utils/l402CredentialsManager';

export function useVideoFlow() {
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [invoice, setInvoice] = useState<string>("");
    const [macaroon, setMacaroon] = useState<string>("");
    const [paymentHash, setPaymentHash] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    
    const handleUriSubmit = useCallback(async (uri: string) => {
        try {
            // 
            const data = await handleL402URIScheme(uri)
            setVideoInfo(data);
            
            const { access: { endpoint } } = data;
            if (!endpoint) {
                throw new Error("Invalid endpoint")
            }
            
            const storedAuthHeader = L402CredentialManager.getCredentials(endpoint)
            console.log('fetched credentials: ', endpoint, storedAuthHeader)
            // The user already bought the video, stream directly with L402 auth header
            if (storedAuthHeader) {
                const hls_url = await fetchL402Video(endpoint, storedAuthHeader)
                setVideoUrl(hls_url);
                return
            }
            
            // The user has not bought the video yet, so we need to make a signed L402 purchase
            // with our pubkey
            const { invoice, macaroon } = await makeStreamVideoRequest(endpoint)
                setInvoice(invoice);
                setMacaroon(macaroon);
                console.log('invoice', invoice)
                setPaymentHash(extractPaymentHash(invoice));
            
            
        } catch (error) {
            console.error('Error fetching video info:', error);
        }
    }, []);
    
    const handlePaymentComplete = useCallback(async (preimage: string) => {
        if (videoInfo && paymentHash) {
            const { access: { endpoint } } = videoInfo;
            const authHeader = `L402 ${macaroon}:${preimage}`
            const hls_url = await fetchL402Video(endpoint, authHeader);

            L402CredentialManager.saveCredentials(endpoint, authHeader)
            console.log('saved credentials: ', endpoint, authHeader)
            setVideoUrl(hls_url);
        }
    }, [videoInfo, paymentHash, macaroon]);
    
    return {
        videoInfo,
        invoice,
        paymentHash,
        videoUrl,
        handleUriSubmit,
        handlePaymentComplete
    };
}