# save as collect_files.py
from pathlib import Path

# python collect_files.py

def collect_files(root: Path, out_file: Path):
    # names to always skip
    SKIP_DIRS = {"node_modules"}            # folder names (case-insensitive)
    SKIP_FILES = {"package-lock.json", "collect_files.py", "data.json"}      # file names (case-insensitive)

    with out_file.open("w", encoding="utf-8", errors="replace") as out:
        for path in root.rglob("*"):
            # skip directories named node_modules
            if path.is_dir() and path.name.lower() in SKIP_DIRS:
                # tell rglob to skip walking this directory by continuing;
                # rglob can't prune, so we rely on the name check below for files
                continue

            # only process files
            if not path.is_file():
                continue

            # skip any file inside a node_modules folder (defensive)
            if any(part.lower() in SKIP_DIRS for part in path.parts):
                continue

            # skip package-lock.json anywhere
            if path.name.lower() in SKIP_FILES:
                continue

            # write a simple header + file contents
            rel = path.relative_to(root)
            out.write(f"\n===== FILE: {rel} =====\n")
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except Exception as e:
                text = f"[Could not read file due to: {e}]"
            out.write(text)
            out.write("\n")  # final newline after each file

if __name__ == "__main__":
    # change these if you like
    project_root = Path(".").resolve()      # current folder
    output_path = Path("all_files.txt")     # output file name
    collect_files(project_root, output_path)
    print(f"Done. Wrote to {output_path}")
