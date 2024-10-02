import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(error => console.log("Playback was prevented:", error));
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(error => console.log("Playback was prevented:", error));
        });
      }
    }
  }, [url]);

  return (
    <div className="mt-4 video-container" style={{ maxWidth: '853px', margin: '0 auto' }}>
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
        <video 
          ref={videoRef} 
          controls 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          Your browser does not support the video tag or HLS playback.
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;