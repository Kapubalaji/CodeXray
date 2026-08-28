from app.main import compile_c_code, execute_c_code
from app.models import CompileRequest, ExecuteRequest

def test_compile_valid_c():
    req = CompileRequest(
        filename="sum.c",
        code="#include <stdio.h>\nint main() { printf(\"30\\n\"); return 0; }\n"
    )
    res = compile_c_code(req)
    assert res.success is True
    assert res.filename == "sum.c"
    assert res.failed_stage is None
    
    stages = res.stages
    assert stages["source"]["status"] == "success"
    assert stages["preprocessing"]["status"] == "success"
    assert "#include <stdio.h>" not in stages["preprocessing"]["content"]  # preprocessed content expanded
    assert stages["llvm_ir"]["status"] == "success"
    assert "define" in stages["llvm_ir"]["content"] or "target" in stages["llvm_ir"]["content"]
    assert stages["assembly"]["status"] == "success"
    assert "main:" in stages["assembly"]["content"]
    assert stages["object"]["status"] == "success"
    assert stages["object"]["representation"] == "disassembly"
    assert "main" in stages["object"]["content"]
    assert stages["linking"]["status"] == "success"
    assert stages["execution"]["status"] == "not_executed"

def test_compile_invalid_c_syntax_error():
    req = CompileRequest(
        filename="bad.c",
        code="#include <stdio.h>\nint main() { printf(\"hello\") return 0; }\n"
    )
    res = compile_c_code(req)
    assert res.success is False
    assert res.failed_stage in ["preprocessing", "llvm_ir", "assembly", "object", "linking"]
    assert len(res.errors) > 0
    err = res.errors[0]
    assert err.type == "compiler_error"
    assert err.line is not None

def test_compile_empty_code():
    req = CompileRequest(filename="empty.c", code="")
    res = compile_c_code(req)
    assert res.success is False
    assert res.failed_stage == "validation"
    assert res.errors[0].type == "validation_error"

def test_execute_valid_c():
    req = ExecuteRequest(
        filename="sum.c",
        code="#include <stdio.h>\nint main() { printf(\"30\\n\"); return 0; }\n"
    )
    res = execute_c_code(req)
    assert res.success is True
    assert res.stdout == "30\n"
    assert res.exit_code == 0

def test_execute_non_zero_exit_code():
    req = ExecuteRequest(
        filename="fail.c",
        code="int main() { return 42; }\n"
    )
    res = execute_c_code(req)
    assert res.success is False
    assert res.exit_code == 42

def test_execute_timeout():
    req = ExecuteRequest(
        filename="loop.c",
        code="int main() { while(1); return 0; }\n"
    )
    res = execute_c_code(req)
    assert res.success is False
    assert "timed out" in res.error.lower() or "timeout" in res.stderr.lower()
