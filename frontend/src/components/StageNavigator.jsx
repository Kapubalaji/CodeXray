import React from 'react';

const STAGE_CONFIG = [
  { id: 'source', label: '1. C Source' },
  { id: 'preprocessing', label: '2. Preprocessing' },
  { id: 'llvm_ir', label: '3. LLVM IR' },
  { id: 'assembly', label: '4. Assembly' },
  { id: 'object', label: '5. Object Code' },
  { id: 'linking', label: '6. Linking' },
  { id: 'execution', label: '7. Execution' },
];

export default function StageNavigator({ stagesState, activeStageId, onSelectStage }) {
  const renderIcon = (status) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'failed':
        return '✗';
      case 'running':
        return '⏳';
      case 'not_executed':
      case 'pending':
      default:
        return '○';
    }
  };

  return (
    <div className="navigator-panel">
      <div className="panel-header">
        <span>Pipeline Stages</span>
      </div>
      <div className="stage-list">
        {STAGE_CONFIG.map((stage) => {
          const status = stagesState[stage.id]?.status || 'pending';
          const isActive = activeStageId === stage.id;
          return (
            <div
              key={stage.id}
              className={`stage-item status-${status} ${isActive ? 'active' : ''}`}
              onClick={() => onSelectStage(stage.id)}
            >
              <div className="stage-icon">{renderIcon(status)}</div>
              <span>{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
