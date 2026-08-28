import React from 'react';

export default function OutputPanel({ compilationData }) {
  if (!compilationData) {
    return (
      <div className="output-panel">
        <div className="panel-header">
          <span>Execution Output & Diagnostic Panel</span>
        </div>
        <div className="output-content" style={{ color: '#8b949e' }}>
          Console output and compiler diagnostics will appear here after running compilation.
        </div>
      </div>
    );
  }

  const { success, failed_stage, errors, stages } = compilationData;
  const executionStage = stages?.execution;

  return (
    <div className="output-panel">
      <div className="panel-header">
        <span>Execution Output & Diagnostic Panel</span>
        {success ? (
          <span style={{ color: '#3fb950', fontSize: '0.8rem', fontWeight: 600 }}>Pipeline Complete ✓</span>
        ) : (
          <span className="error-badge">Failed Stage: {failed_stage || 'Unknown'}</span>
        )}
      </div>
      <div className="output-content">
        {!success && errors && errors.length > 0 && (
          <div className="output-stderr">
            {errors.map((err, idx) => (
              <div key={idx}>
                <strong>[Compiler Error in {err.stage}]</strong> Line {err.line}:{err.column} - {err.message}
              </div>
            ))}
          </div>
        )}

        {success && executionStage && (
          <div>
            {executionStage.stdout && <div className="output-stdout">{executionStage.stdout}</div>}
            {executionStage.stderr && <div className="output-stderr">{executionStage.stderr}</div>}
            <div style={{ color: '#8b949e', marginTop: '6px', fontSize: '0.8rem' }}>
              Exit Code: {executionStage.exit_code ?? 0}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
