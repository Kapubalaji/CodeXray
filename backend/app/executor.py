import os
import time
import subprocess
import tempfile
from app.models import ExecuteResponse
from app.compiler import run_cmd

EXECUTION_TIMEOUT_SECONDS = 5.0
MAX_OUTPUT_LENGTH = 50 * 1024  # 50 KB max stdout/stderr capture

def execute_code(filename: str, code: str) -> ExecuteResponse:
    if not code or not code.strip():
        return ExecuteResponse(
            success=False,
            error="C source code cannot be empty."
        )

    base_name = os.path.splitext(filename)[0] or "main"

    with tempfile.TemporaryDirectory() as temp_dir:
        src_file = os.path.join(temp_dir, f"{base_name}.c")
        with open(src_file, "w", encoding="utf-8") as f:
            f.write(code)

        # 1. Compile
        bin_file = os.path.join(temp_dir, "a.out")
        ret, stdout, stderr, _ = run_cmd(["gcc", f"{base_name}.c", "-o", "a.out"], cwd=temp_dir)
        if ret != 0 or not os.path.exists(bin_file):
            return ExecuteResponse(
                success=False,
                stderr=stderr,
                error="Compilation failed prior to execution."
            )

        # 2. Execute with safety guards
        start_time = time.time()
        try:
            proc = subprocess.run(
                ["./a.out"],
                cwd=temp_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=EXECUTION_TIMEOUT_SECONDS
            )
            elapsed_ms = round((time.time() - start_time) * 1000, 2)

            out_str = proc.stdout[:MAX_OUTPUT_LENGTH]
            err_str = proc.stderr[:MAX_OUTPUT_LENGTH]

            if len(proc.stdout) > MAX_OUTPUT_LENGTH:
                out_str += "\n[Truncated: stdout limit exceeded]"
            if len(proc.stderr) > MAX_OUTPUT_LENGTH:
                err_str += "\n[Truncated: stderr limit exceeded]"

            return ExecuteResponse(
                success=(proc.returncode == 0),
                stdout=out_str,
                stderr=err_str,
                exit_code=proc.returncode,
                execution_time_ms=elapsed_ms
            )
        except subprocess.TimeoutExpired:
            elapsed_ms = round((time.time() - start_time) * 1000, 2)
            return ExecuteResponse(
                success=False,
                stdout="",
                stderr="Process killed due to timeout limit (5s).",
                exit_code=None,
                execution_time_ms=elapsed_ms,
                error="Execution timed out"
            )
