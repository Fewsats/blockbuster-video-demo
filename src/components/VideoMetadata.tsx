import React, { useState, useRef, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';

interface VideoMetadataProps {
  metadata: {
    name: string;
    description: string;
    cover_url: string;
    pricing: { amount: number; currency: string }[];
  };
  videoUrl: string | null;
}

const VideoMetadata: React.FC<VideoMetadataProps> = ({ metadata, videoUrl }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showButton, setShowButton] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (descriptionRef.current) {
      setShowButton(descriptionRef.current.scrollHeight > 60);
    }
  }, [metadata.description]);

  console.log('videoURL ', videoUrl)
  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg shadow-lg">
      <div className="video-container" style={{ maxWidth: '853px', margin: '0 auto' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          {videoUrl ? (
            <VideoPlayer url={videoUrl} />
          ) : (
            <img
              src={metadata.cover_url}
              alt={metadata.name}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{metadata.name}</h2>
        <div className="mb-4">
          <p
            ref={descriptionRef}
            className={`text-gray-600 whitespace-pre-wrap ${isCollapsed ? 'line-clamp-3' : ''}`}
            style={{ transition: 'max-height 0.3s ease-out' }}
          >
            {metadata.description}
          </p>
          {showButton && (
            <button
              className="text-blue-600 font-semibold mt-1"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? 'Show more' : 'Show less'}
            </button>
          )}
        </div>
        <p className="text-lg font-semibold">
          Price: ${((metadata.pricing[0].amount / 100).toFixed(2))} {metadata.pricing[0].currency}
        </p>
      </div>
    </div>
  );
};

export default VideoMetadata;