import React from 'react';

export default function ArtifactViewer({ filename, content, type, representation, stderr }) {
  if (stderr) {
    return (
      <div className="artifact-container">
        <div className="artifact-header">
          <span>{filename || 'stderr'}</span>
          <span>Compiler Stderr</span>
        </div>
        <div className="artifact-content output-stderr">
          {stderr}
        </div>
      </div>
    );
  }

  return (
    <div className="artifact-container">
      <div className="artifact-header">
        <span>{filename || 'artifact'}</span>
        <span>{representation ? `Format: ${representation}` : `Type: ${type || 'text'}`}</span>
      </div>
      <div className="artifact-content">
        {content || '(No artifact content generated for this stage)'}
      </div>
    </div>
  );
}
