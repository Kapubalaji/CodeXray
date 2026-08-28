import React from 'react';

const SAMPLES = {
  valid: `#include <stdio.h>\n\nint main() {\n    int a = 10;\n    int b = 20;\n    int sum = a + b;\n    printf("Sum: %d\\n", sum);\n    return 0;\n}\n`,
  invalid: `#include <stdio.h>\n\nint main() {\n    int a = 10\n    printf("Missing semicolon!\\n");\n    return 0;\n}\n`
};

export default function CodeEditor({ code, setCode, onVisualize, isRunning }) {
  const handleSampleChange = (e) => {
    const key = e.target.value;
    if (SAMPLES[key]) {
      setCode(SAMPLES[key]);
    }
  };

  return (
    <div className="editor-panel">
      <div className="panel-header">
        <span>C Source Editor</span>
        <select className="sample-select" onChange={handleSampleChange} defaultValue="valid">
          <option value="valid">Sample: Valid C</option>
          <option value="invalid">Sample: Syntax Error</option>
        </select>
      </div>
      <textarea
        className="editor-textarea"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Type C code here..."
        spellCheck="false"
      />
      <div className="action-bar">
        <button
          className="btn-primary"
          onClick={onVisualize}
          disabled={isRunning || !code.trim()}
        >
          {isRunning ? 'Visualizing Compilation...' : 'Visualize Compilation'}
        </button>
      </div>
    </div>
  );
}
