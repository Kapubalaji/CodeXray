from fastapi import FastAPI
from app.models import (
    HealthResponse,
    StagesListResponse,
    StageInfo,
    CompileRequest,
    CompileResponse,
    ExecuteRequest,
    ExecuteResponse,
)
from app.compiler import process_compilation
from app.executor import execute_code

app = FastAPI(
    title="CodeXRay Backend",
    description="Educational C compilation and execution visualization API",
    version="1.0.0"
)

SUPPORTED_STAGES = [
    StageInfo(id="source", name="C Source", order=1),
    StageInfo(id="preprocessing", name="Preprocessing", order=2),
    StageInfo(id="llvm_ir", name="LLVM IR", order=3),
    StageInfo(id="assembly", name="Assembly", order=4),
    StageInfo(id="object", name="Object Code", order=5),
    StageInfo(id="linking", name="Linking", order=6),
    StageInfo(id="execution", name="Execution", order=7),
]

@app.get("/api/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse()

@app.get("/api/stages", response_model=StagesListResponse)
def get_stages() -> StagesListResponse:
    return StagesListResponse(stages=SUPPORTED_STAGES)

@app.post("/api/compile", response_model=CompileResponse)
def compile_c_code(req: CompileRequest) -> CompileResponse:
    return process_compilation(req.filename, req.code)

@app.post("/api/execute", response_model=ExecuteResponse)
def execute_c_code(req: ExecuteRequest) -> ExecuteResponse:
    return execute_code(req.filename, req.code)

