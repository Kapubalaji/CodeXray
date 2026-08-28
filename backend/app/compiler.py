import os
import time
import subprocess
import tempfile
from typing import Dict, Any, List, Optional
from app.models import Artifact, CompileResponse, ErrorItem
from app.utils import parse_compiler_errors

MAX_CODE_SIZE = 100 * 1024  # 100 KB limit for input C code

def not_executed_artifact(file_name: str) -> Dict[str, Any]:
    return {
        "file": file_name,
        "type": "text",
        "status": "not_executed",
        "content": None
    }

def run_cmd(cmd: List[str], cwd: str, timeout: float = 5.0) -> Tuple[int, str, str, float]:
    start_time = time.time()
    try:
        proc = subprocess.run(
            cmd,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout
        )
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return proc.returncode, proc.stdout, proc.stderr, elapsed_ms
    except subprocess.TimeoutExpired:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        return -1, "", "Command timed out", elapsed_ms

def process_compilation(filename: str, code: str) -> CompileResponse:
    # 1. Validation
    if not code or not code.strip():
        return CompileResponse(
            success=False,
            filename=filename,
            failed_stage="validation",
            stages={
                "source": not_executed_artifact(filename),
                "preprocessing": not_executed_artifact("source.i"),
                "llvm_ir": not_executed_artifact("source.ll"),
                "assembly": not_executed_artifact("source.s"),
                "object": not_executed_artifact("source.o"),
                "linking": not_executed_artifact("a.out"),
                "execution": not_executed_artifact("execution")
            },
            errors=[ErrorItem(stage="validation", type="validation_error", message="C source code cannot be empty.")],
            warnings=[]
        )

    if len(code) > MAX_CODE_SIZE:
        return CompileResponse(
            success=False,
            filename=filename,
            failed_stage="validation",
            stages={
                "source": not_executed_artifact(filename),
                "preprocessing": not_executed_artifact("source.i"),
                "llvm_ir": not_executed_artifact("source.ll"),
                "assembly": not_executed_artifact("source.s"),
                "object": not_executed_artifact("source.o"),
                "linking": not_executed_artifact("a.out"),
                "execution": not_executed_artifact("execution")
            },
            errors=[ErrorItem(stage="validation", type="validation_error", message=f"C source code exceeds size limit of {MAX_CODE_SIZE} bytes.")],
            warnings=[]
        )

    stages_dict: Dict[str, Any] = {}
    all_errors: List[ErrorItem] = []
    all_warnings: List[str] = []
    base_name = os.path.splitext(filename)[0] or "main"

    with tempfile.TemporaryDirectory() as temp_dir:
        src_file_path = os.path.join(temp_dir, f"{base_name}.c")
        
        # STAGE 1: Source
        with open(src_file_path, "w", encoding="utf-8") as f:
            f.write(code)
        
        stages_dict["source"] = {
            "file": f"{base_name}.c",
            "type": "text",
            "status": "success",
            "content": code
        }

        # STAGE 2: Preprocessing (gcc -E)
        prep_file_path = os.path.join(temp_dir, f"{base_name}.i")
        ret, stdout, stderr, elapsed = run_cmd(["gcc", "-E", f"{base_name}.c", "-o", f"{base_name}.i"], cwd=temp_dir)
        if ret == 0 and os.path.exists(prep_file_path):
            with open(prep_file_path, "r", encoding="utf-8", errors="replace") as f:
                prep_content = f.read()
            stages_dict["preprocessing"] = {
                "file": f"{base_name}.i",
                "type": "text",
                "status": "success",
                "content": prep_content,
                "execution_time_ms": elapsed
            }
        else:
            errs, warns = parse_compiler_errors(stderr, "preprocessing")
            all_errors.extend(errs)
            all_warnings.extend(warns)
            stages_dict["preprocessing"] = {
                "file": f"{base_name}.i",
                "type": "text",
                "status": "failed",
                "content": None,
                "stderr": stderr,
                "execution_time_ms": elapsed
            }
            # Fill remaining stages as not executed
            stages_dict["llvm_ir"] = not_executed_artifact(f"{base_name}.ll")
            stages_dict["assembly"] = not_executed_artifact(f"{base_name}.s")
            stages_dict["object"] = not_executed_artifact(f"{base_name}.o")
            stages_dict["linking"] = not_executed_artifact("a.out")
            stages_dict["execution"] = not_executed_artifact("execution")
            return CompileResponse(
                success=False,
                filename=filename,
                failed_stage="preprocessing",
                stages=stages_dict,
                errors=all_errors,
                warnings=all_warnings
            )

        # STAGE 3: LLVM IR (clang -S -emit-llvm)
        llvm_file_path = os.path.join(temp_dir, f"{base_name}.ll")
        ret, stdout, stderr, elapsed = run_cmd(["clang", "-S", "-emit-llvm", f"{base_name}.c", "-o", f"{base_name}.ll"], cwd=temp_dir)
        if ret == 0 and os.path.exists(llvm_file_path):
            with open(llvm_file_path, "r", encoding="utf-8", errors="replace") as f:
                llvm_content = f.read()
            stages_dict["llvm_ir"] = {
                "file": f"{base_name}.ll",
                "type": "text",
                "status": "success",
                "content": llvm_content,
                "execution_time_ms": elapsed
            }
        else:
            errs, warns = parse_compiler_errors(stderr, "llvm_ir")
            all_errors.extend(errs)
            all_warnings.extend(warns)
            stages_dict["llvm_ir"] = {
                "file": f"{base_name}.ll",
                "type": "text",
                "status": "failed",
                "content": None,
                "stderr": stderr,
                "execution_time_ms": elapsed
            }
            stages_dict["assembly"] = not_executed_artifact(f"{base_name}.s")
            stages_dict["object"] = not_executed_artifact(f"{base_name}.o")
            stages_dict["linking"] = not_executed_artifact("a.out")
            stages_dict["execution"] = not_executed_artifact("execution")
            return CompileResponse(
                success=False,
                filename=filename,
                failed_stage="llvm_ir",
                stages=stages_dict,
                errors=all_errors,
                warnings=all_warnings
            )

        # STAGE 4: Assembly (gcc -S)
        asm_file_path = os.path.join(temp_dir, f"{base_name}.s")
        ret, stdout, stderr, elapsed = run_cmd(["gcc", "-S", f"{base_name}.c", "-o", f"{base_name}.s"], cwd=temp_dir)
        if ret == 0 and os.path.exists(asm_file_path):
            with open(asm_file_path, "r", encoding="utf-8", errors="replace") as f:
                asm_content = f.read()
            stages_dict["assembly"] = {
                "file": f"{base_name}.s",
                "type": "text",
                "status": "success",
                "content": asm_content,
                "execution_time_ms": elapsed
            }
        else:
            errs, warns = parse_compiler_errors(stderr, "assembly")
            all_errors.extend(errs)
            all_warnings.extend(warns)
            stages_dict["assembly"] = {
                "file": f"{base_name}.s",
                "type": "text",
                "status": "failed",
                "content": None,
                "stderr": stderr,
                "execution_time_ms": elapsed
            }
            stages_dict["object"] = not_executed_artifact(f"{base_name}.o")
            stages_dict["linking"] = not_executed_artifact("a.out")
            stages_dict["execution"] = not_executed_artifact("execution")
            return CompileResponse(
                success=False,
                filename=filename,
                failed_stage="assembly",
                stages=stages_dict,
                errors=all_errors,
                warnings=all_warnings
            )

        # STAGE 5: Object Code (gcc -c & objdump -d)
        obj_file_path = os.path.join(temp_dir, f"{base_name}.o")
        ret, stdout, stderr, elapsed = run_cmd(["gcc", "-c", f"{base_name}.c", "-o", f"{base_name}.o"], cwd=temp_dir)
        if ret == 0 and os.path.exists(obj_file_path):
            # Run objdump to get disassembly representation
            dis_ret, dis_stdout, dis_stderr, _ = run_cmd(["objdump", "-d", f"{base_name}.o"], cwd=temp_dir)
            obj_content = dis_stdout if dis_ret == 0 else "Disassembly unavailable"
            stages_dict["object"] = {
                "file": f"{base_name}.o",
                "type": "binary",
                "status": "success",
                "representation": "disassembly",
                "content": obj_content,
                "execution_time_ms": elapsed
            }
        else:
            errs, warns = parse_compiler_errors(stderr, "object")
            all_errors.extend(errs)
            all_warnings.extend(warns)
            stages_dict["object"] = {
                "file": f"{base_name}.o",
                "type": "binary",
                "status": "failed",
                "representation": "disassembly",
                "content": None,
                "stderr": stderr,
                "execution_time_ms": elapsed
            }
            stages_dict["linking"] = not_executed_artifact("a.out")
            stages_dict["execution"] = not_executed_artifact("execution")
            return CompileResponse(
                success=False,
                filename=filename,
                failed_stage="object",
                stages=stages_dict,
                errors=all_errors,
                warnings=all_warnings
            )

        # STAGE 6: Linking (gcc -> binary)
        bin_file_path = os.path.join(temp_dir, "a.out")
        ret, stdout, stderr, elapsed = run_cmd(["gcc", f"{base_name}.o", "-o", "a.out"], cwd=temp_dir)
        if ret == 0 and os.path.exists(bin_file_path):
            stages_dict["linking"] = {
                "file": "a.out",
                "type": "binary",
                "status": "success",
                "content": "[Executable Binary Generated]",
                "execution_time_ms": elapsed
            }
        else:
            errs, warns = parse_compiler_errors(stderr, "linking")
            all_errors.extend(errs)
            all_warnings.extend(warns)
            stages_dict["linking"] = {
                "file": "a.out",
                "type": "binary",
                "status": "failed",
                "content": None,
                "stderr": stderr,
                "execution_time_ms": elapsed
            }
            stages_dict["execution"] = not_executed_artifact("execution")
            return CompileResponse(
                success=False,
                filename=filename,
                failed_stage="linking",
                stages=stages_dict,
                errors=all_errors,
                warnings=all_warnings
            )

        # STAGE 7: Execution stage holder (for compile call, execution is ready / not executed yet)
        stages_dict["execution"] = {
            "file": "execution",
            "type": "text",
            "status": "not_executed",
            "content": "Program ready for execution"
        }

        return CompileResponse(
            success=True,
            filename=filename,
            failed_stage=None,
            stages=stages_dict,
            errors=[],
            warnings=all_warnings
        )
