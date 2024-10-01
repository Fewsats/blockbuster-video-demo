import React from 'react';

interface VideoMetadataProps {
  metadata: {
    name: string;
    description: string;
    cover_url: string;
    pricing: { amount: number; currency: string }[];
  };
}

const VideoMetadata: React.FC<VideoMetadataProps> = ({ metadata }) => {
  return (
    <div className="overflow-hidden border border-gray-200 rounded-lg shadow-lg">
      <img
        src={metadata.cover_url}
        alt={metadata.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">{metadata.name}</h2>
        <p className="text-gray-600 mb-4">{metadata.description}</p>
        <p className="text-lg font-semibold">
          Price: {metadata.pricing[0].amount} {metadata.pricing[0].currency}
        </p>
      </div>
    </div>
  );
};

export default VideoMetadata;