import React, { useState, useEffect } from 'react';

interface UriInputProps {
  onUriSubmit: (uri: string) => void;
  initialUri: string;
}

const UriInput: React.FC<UriInputProps> = ({ onUriSubmit, initialUri }) => {
  const [uri, setUri] = useState(initialUri);

  useEffect(() => {
    setUri(initialUri);
  }, [initialUri]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUriSubmit(uri);
  };

  return (
    <form onSubmit={handleSubmit} className="flex mb-4">
      <input
        type="text"
        value={uri}
        onChange={(e) => setUri(e.target.value)}
        placeholder="Enter L402 URI"
        className="flex-grow p-2 text-lg border border-gray-300 rounded-l"
      />
      <button
        type="submit"
        className="px-4 py-2 text-lg text-white bg-blue-500 rounded-r hover:bg-blue-600"
      >
        Load Video Info
      </button>
    </form>
  );
};

export default UriInput;