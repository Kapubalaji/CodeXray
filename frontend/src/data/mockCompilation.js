export const MOCK_SUCCESS_RESPONSE = {
  success: true,
  filename: "sum.c",
  stages: {
    source: {
      file: "sum.c",
      type: "text",
      status: "success",
      content: `#include <stdio.h>\n\nint main() {\n    int a = 10;\n    int b = 20;\n    int sum = a + b;\n    printf("Sum: %d\\n", sum);\n    return 0;\n}\n`
    },
    preprocessing: {
      file: "sum.i",
      type: "text",
      status: "success",
      execution_time_ms: 1.45,
      content: `# 1 "sum.c"\n# 1 "<built-in>"\n# 1 "<command-line>"\n# 1 "/usr/include/stdio.h" 1 3 4\n...\ntypedef struct _IO_FILE FILE;\nextern int printf (const char *__restrict __format, ...);\n# 3 "sum.c" 2\n\nint main() {\n    int a = 10;\n    int b = 20;\n    int sum = a + b;\n    printf("Sum: %d\\n", sum);\n    return 0;\n}\n`
    },
    llvm_ir: {
      file: "sum.ll",
      type: "text",
      status: "success",
      execution_time_ms: 4.82,
      content: `; ModuleID = 'sum.c'\nsource_filename = "sum.c"\ntarget datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-i128:128-f80:128-n8:16:32:64-S128"\ntarget triple = "x86_64-pc-linux-gnu"\n\n@.str = private unnamed_addr constant [9 x i8] c"Sum: %d\\0A\\00", align 1\n\ndefine dso_local i32 @main() {\n  %1 = alloca i32, align 4\n  %2 = alloca i32, align 4\n  %3 = alloca i32, align 4\n  %4 = alloca i32, align 4\n  store i32 0, ptr %1, align 4\n  store i32 10, ptr %2, align 4\n  store i32 20, ptr %3, align 4\n  %5 = load i32, ptr %2, align 4\n  %6 = load i32, ptr %3, align 4\n  %7 = add nsw i32 %5, %6\n  store i32 %7, ptr %4, align 4\n  %8 = load i32, ptr %4, align 4\n  %9 = call i32 (ptr, ...) @printf(ptr noundef @.str, i32 noundef %8)\n  ret i32 0\n}\n\ndeclare i32 @printf(ptr noundef, ...)\n`
    },
    assembly: {
      file: "sum.s",
      type: "text",
      status: "success",
      execution_time_ms: 2.11,
      content: `\t.file\t"sum.c"\n\t.text\n\t.section\t.rodata\n.LC0:\n\t.string\t"Sum: %d\\n"\n\t.text\n\t.globl\tmain\n\t.type\tmain, @function\nmain:\n.LFB0:\n\tpushq\t%rbp\n\tmovq\t%rsp, %rbp\n\tsubq\t$16, %rsp\n\tmovl\t$10, -4(%rbp)\n\tmovl\t$20, -8(%rbp)\n\tmovl\t-4(%rbp), %edx\n\tmovl\t-8(%rbp), %eax\n\taddl\t%edx, %eax\n\tmovl\t%eax, -12(%rbp)\n\tmovl\t-12(%rbp), %eax\n\tmovl\t%eax, %esi\n\tleaq\t.LC0(%rip), %rax\n\tmovq\t%rax, %rdi\n\tmovl\t$0, %eax\n\tcall\tprintf@PLT\n\tmovl\t$0, %eax\n\tleave\n\tret\n`
    },
    object: {
      file: "sum.o",
      type: "binary",
      status: "success",
      representation: "disassembly",
      execution_time_ms: 3.05,
      content: `sum.o:     file format elf64-x86-64\n\nDisassembly of section .text:\n\n0000000000000000 <main>:\n   0:\t55                   \tpush   %rbp\n   1:\t48 89 e5             \tmov    %rsp,%rbp\n   4:\t48 83 ec 10          \tsub    $0x10,%rsp\n   8:\tc7 45 fc 0a 00 00 00 \tmovl   $0xa,-0x4(%rbp)\n   f:\tc7 45 f8 14 00 00 00 \tmovl   $0x14,-0x8(%rbp)\n  16:\t8b 55 fc             \tmov    -0x4(%rbp),%edx\n  19:\t8b 45 f8             \tmov    -0x8(%rbp),%eax\n  1c:\t01 d0                \tadd    %edx,%eax\n  1e:\t89 45 f4             \tmov    -0x4(%rbp),%eax\n  21:\t89 c6                \tmov    %eax,%esi\n  23:\t48 8d 05 00 00 00 00 \tlea    0x0(%rip),%rax\n  2a:\t48 89 c7             \tmov    %rax,%rdi\n  2d:\tb8 00 00 00 00       \tmov    $0x0,%eax\n  32:\te8 00 00 00 00       \tcall   37 <main+0x37>\n  37:\tb8 00 00 00 00       \tmov    $0x0,%eax\n  3c:\tc9                   \tleave  \n  3d:\tc3                   \tret    \n`
    },
    linking: {
      file: "a.out",
      type: "binary",
      status: "success",
      execution_time_ms: 3.50,
      content: "[ELF Executable Binary Generated - Object files linked with standard libraries (libc)]"
    },
    execution: {
      file: "execution",
      type: "text",
      status: "success",
      execution_time_ms: 2.10,
      stdout: "Sum: 30\n",
      stderr: "",
      exit_code: 0
    }
  },
  errors: [],
  warnings: []
};

export const MOCK_ERROR_RESPONSE = {
  success: false,
  filename: "error.c",
  failed_stage: "llvm_ir",
  stages: {
    source: {
      file: "error.c",
      type: "text",
      status: "success",
      content: `#include <stdio.h>\n\nint main() {\n    int a = 10\n    printf("Missing semicolon!\\n");\n    return 0;\n}\n`
    },
    preprocessing: {
      file: "error.i",
      type: "text",
      status: "success",
      execution_time_ms: 1.20,
      content: `# 1 "error.c"\n...\nint main() {\n    int a = 10\n    printf("Missing semicolon!\\n");\n    return 0;\n}\n`
    },
    llvm_ir: {
      file: "error.ll",
      type: "text",
      status: "failed",
      execution_time_ms: 2.40,
      stderr: "error.c:4:15: error: expected ';' at end of declaration\n    int a = 10\n              ^\n              ;"
    },
    assembly: {
      file: "error.s",
      type: "text",
      status: "not_executed",
      content: null
    },
    object: {
      file: "error.o",
      type: "binary",
      status: "not_executed",
      content: null
    },
    linking: {
      file: "a.out",
      type: "binary",
      status: "not_executed",
      content: null
    },
    execution: {
      file: "execution",
      type: "text",
      status: "not_executed",
      content: null
    }
  },
  errors: [
    {
      stage: "llvm_ir",
      type: "compiler_error",
      message: "expected ';' at end of declaration",
      line: 4,
      column: 15
    }
  ],
  warnings: []
};

export const STAGE_EXPLANATIONS = {
  source: {
    title: "C Source Code",
    input: "Human-written C code (.c)",
    output: "Source File",
    explanation: "High-level programming code written by the developer. Human-readable and structured according to C syntax rules."
  },
  preprocessing: {
    title: "Preprocessing Stage",
    input: "source.c",
    output: "source.i",
    explanation: "The preprocessor resolves directives starting with '#' like #include and #define. Header contents are expanded, macros are replaced, and comments are stripped."
  },
  llvm_ir: {
    title: "LLVM Intermediate Representation (IR)",
    input: "source.i",
    output: "source.ll",
    explanation: "LLVM IR is a strongly-typed, instruction-set-independent intermediate language. It allows the compiler to perform architecture-agnostic optimizations before generating assembly code."
  },
  assembly: {
    title: "Assembly Stage",
    input: "source.ll",
    output: "source.s",
    explanation: "Translates IR code into human-readable target machine architecture instructions (e.g. x86_64 CPU instructions like push, mov, add, call)."
  },
  object: {
    title: "Object Code Compilation",
    input: "source.s",
    output: "source.o",
    explanation: "Assembles machine instructions into relocatable machine code (ELF object file). Shown here formatted cleanly as machine disassembly via objdump."
  },
  linking: {
    title: "Linking Stage",
    input: "source.o + C Standard Library (libc)",
    output: "a.out (Executable Binary)",
    explanation: "Combines object files with system startup code and external C runtime libraries (e.g., printf implementation from libc) into a final executable binary."
  },
  execution: {
    title: "Program Execution",
    input: "a.out",
    output: "Console Output / Exit Code",
    explanation: "The OS loads the binary into virtual memory and transfers CPU instruction control to main(). Program stdout/stderr and exit codes are captured."
  }
};
