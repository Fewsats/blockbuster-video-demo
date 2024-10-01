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
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Video Player</h2>
      <video ref={videoRef} controls width="100%" height="auto">
        Your browser does not support the video tag or HLS playback.
      </video>
    </div>
  );
};

export default VideoPlayer;