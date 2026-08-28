import re
from typing import List, Tuple
from app.models import ErrorItem

# GCC / Clang stderr error pattern: file:line:col: error/warning: message
ERROR_PATTERN = re.compile(r"^([^:\n]+):(\d+):(\d+):\s+(error|warning):\s+(.+)$", re.MULTILINE)

def parse_compiler_errors(stderr: str, stage_name: str) -> Tuple[List[ErrorItem], List[str]]:
    """Parse compiler stderr to extract structured errors and warnings."""
    errors: List[ErrorItem] = []
    warnings: List[str] = []

    if not stderr.strip():
        return errors, warnings

    matches = ERROR_PATTERN.findall(stderr)
    if matches:
        for match in matches:
            _, line_str, col_str, severity, message = match
            if severity == "error":
                errors.append(
                    ErrorItem(
                        stage=stage_name,
                        type="compiler_error",
                        message=message.strip(),
                        line=int(line_str),
                        column=int(col_str)
                    )
                )
            elif severity == "warning":
                warnings.append(f"Line {line_str}:{col_str} - {message.strip()}")
    else:
        # Fallback if pattern didn't match specific line/col format
        errors.append(
            ErrorItem(
                stage=stage_name,
                type="compiler_error",
                message=stderr.strip()
            )
        )

    return errors, warnings
