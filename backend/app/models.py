from typing import Dict, List, Optional, Any, Literal
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "codexray-backend"

class StageInfo(BaseModel):
    id: str
    name: str
    order: int

class StagesListResponse(BaseModel):
    stages: List[StageInfo]

class CompileRequest(BaseModel):
    filename: str = Field(default="main.c")
    code: str

class ExecuteRequest(BaseModel):
    filename: str = Field(default="main.c")
    code: str

class Artifact(BaseModel):
    file: str
    type: Literal["text", "binary"]
    status: Literal["success", "failed", "not_executed"]
    representation: Optional[str] = None
    content: Optional[str] = None
    stdout: Optional[str] = ""
    stderr: Optional[str] = ""
    execution_time_ms: Optional[float] = None

class ErrorItem(BaseModel):
    stage: str
    type: str
    message: str
    line: Optional[int] = None
    column: Optional[int] = None

class CompileResponse(BaseModel):
    success: bool
    filename: str
    failed_stage: Optional[str] = None
    stages: Dict[str, Any]
    errors: List[ErrorItem] = []
    warnings: List[str] = []

class ExecuteResponse(BaseModel):
    success: bool
    stdout: str = ""
    stderr: str = ""
    exit_code: Optional[int] = None
    execution_time_ms: Optional[float] = None
    error: Optional[str] = None
