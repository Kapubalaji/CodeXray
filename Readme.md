# CodeXRay

CodeXRay is an interactive C code compilation visualization and execution analysis tool. It breaks down C source code through each step of the compilation pipeline: preprocessing, LLVM IR generation, assembly, object code disassembly, linking, and execution.

---

## Prerequisites

Before installing and running the project, ensure you have the following installed on your system:

- **Python**: `3.8` or higher
- **Node.js**: `16.x` or higher (includes `npm`)
- **C Compiler Toolchain**:
  - `gcc` (required for preprocessing, assembly, object generation, and linking)
  - `clang` (required for LLVM IR generation)
  - `objdump` (required for object file disassembly)

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CodeXray
```

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (optional but recommended):
   - **On Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - **On Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```

3. Install required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Node modules:
   ```bash
   npm install
   ```

---

## Running the Project

To run CodeXRay, both the backend server and frontend development server must be running concurrently.

### Step 1: Start the Backend API Server

From the `backend` directory (with virtual environment activated):

```bash
uvicorn app.main:app --reload
```

The backend server will run on [http://localhost:8000](http://localhost:8000).

### Step 2: Start the Frontend Application

From the `frontend` directory:

```bash
npm run dev
```

The frontend development server will usually run on [http://localhost:5173](http://localhost:5173).

---

## Running Tests

To run the backend test suite, navigate to the `backend` directory and execute:

```bash
pytest
```
