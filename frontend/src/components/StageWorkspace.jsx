import React from 'react';
import ArtifactViewer from './ArtifactViewer';
import { STAGE_EXPLANATIONS } from '../data/mockCompilation';

export default function StageWorkspace({ stageId, stageData }) {
  const explanation = STAGE_EXPLANATIONS[stageId] || {
    title: stageId,
    input: 'Unknown',
    output: 'Unknown',
    explanation: 'No detailed explanation available for this stage.'
  };

  if (!stageData || stageData.status === 'pending' || stageData.status === 'not_executed') {
    return (
      <div className="workspace-panel">
        <div className="explanation-card">
          <h4>{explanation.title}</h4>
          <p>{explanation.explanation}</p>
        </div>
        <div className="artifact-container">
          <div className="artifact-header">
            <span>Stage Not Executed</span>
          </div>
          <div className="artifact-content" style={{ color: '#8b949e', textAlign: 'center', paddingTop: '40px' }}>
            ○ This stage has not been executed yet. Click "Visualize Compilation" to run the pipeline.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-panel">
      <div className="meta-bar">
        <div className="meta-item">Input: <span>{explanation.input}</span></div>
        <div className="meta-item">Output: <span>{explanation.output}</span></div>
        <div className="meta-item">Status: <span style={{ color: stageData.status === 'success' ? '#3fb950' : '#f85149' }}>{stageData.status}</span></div>
        {stageData.execution_time_ms && (
          <div className="meta-item">Time: <span>{stageData.execution_time_ms} ms</span></div>
        )}
      </div>

      <div className="explanation-card">
        <h4>{explanation.title}</h4>
        <p>{explanation.explanation}</p>
      </div>

      <ArtifactViewer
        filename={stageData.file}
        content={stageData.content}
        type={stageData.type}
        representation={stageData.representation}
        stderr={stageData.stderr}
      />
    </div>
  );
}
