import React, { useState } from 'react';
import Header from './components/Header';
import CodeEditor from './components/CodeEditor';
import StageNavigator from './components/StageNavigator';
import StageWorkspace from './components/StageWorkspace';
import OutputPanel from './components/OutputPanel';
import { compileCode } from './services/api';

const DEFAULT_C_CODE = `#include <stdio.h>\n\nint main() {\n    int a = 10;\n    int b = 20;\n    int sum = a + b;\n    printf("Sum: %d\\n", sum);\n    return 0;\n}\n`;

const STAGE_ORDER = ['source', 'preprocessing', 'llvm_ir', 'assembly', 'object', 'linking', 'execution'];

export default function App() {
  const [code, setCode] = useState(DEFAULT_C_CODE);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStageId, setActiveStageId] = useState('source');
  const [compilationData, setCompilationData] = useState(null);
  
  // Custom interactive state for each stage (pending, running, success, failed, not_executed)
  const [stagesState, setStagesState] = useState({
    source: { status: 'pending' },
    preprocessing: { status: 'pending' },
    llvm_ir: { status: 'pending' },
    assembly: { status: 'pending' },
    object: { status: 'pending' },
    linking: { status: 'pending' },
    execution: { status: 'pending' },
  });

  const handleVisualize = async () => {
    setIsRunning(true);
    
    // Reset stage states
    const resetStates = {};
    STAGE_ORDER.forEach(id => {
      resetStates[id] = { status: 'pending' };
    });
    setStagesState(resetStates);
    setActiveStageId('source');

    // Fetch compilation result (from mock API)
    const data = await compileCode('sum.c', code);
    setCompilationData(data);

    // Run sequential step-by-step animation runner
    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex >= STAGE_ORDER.length) {
        clearInterval(interval);
        setIsRunning(false);
        return;
      }

      const stageId = STAGE_ORDER[stepIndex];
      const targetStageData = data.stages[stageId];

      if (!targetStageData || targetStageData.status === 'not_executed') {
        // Stop execution animation if stage was not executed
        setStagesState(prev => ({
          ...prev,
          [stageId]: { status: 'not_executed' }
        }));
        clearInterval(interval);
        setIsRunning(false);
        return;
      }

      // Mark current stage active and update status from data
      setActiveStageId(stageId);
      setStagesState(prev => ({
        ...prev,
        [stageId]: targetStageData
      }));

      // If this stage failed, halt the remaining stages
      if (targetStageData.status === 'failed') {
        // Mark remaining stages as not_executed
        const haltStates = {};
        for (let i = stepIndex + 1; i < STAGE_ORDER.length; i++) {
          haltStates[STAGE_ORDER[i]] = { status: 'not_executed' };
        }
        setStagesState(prev => ({ ...prev, ...haltStates }));
        clearInterval(interval);
        setIsRunning(false);
        return;
      }

      stepIndex++;
    }, 400); // 400ms delay per stage transition
  };

  const activeStageData = compilationData?.stages?.[activeStageId] || stagesState[activeStageId];

  return (
    <div className="app">
      <Header />
      <div className="main-container">
        <CodeEditor
          code={code}
          setCode={setCode}
          onVisualize={handleVisualize}
          isRunning={isRunning}
        />
        <StageNavigator
          stagesState={stagesState}
          activeStageId={activeStageId}
          onSelectStage={setActiveStageId}
        />
        <div className="workspace-container">
          <StageWorkspace
            stageId={activeStageId}
            stageData={activeStageData}
          />
          <OutputPanel compilationData={compilationData} />
        </div>
      </div>
    </div>
  );
}
