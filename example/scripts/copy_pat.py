import os
import shutil
from pathlib import Path

import os
import shutil

def copy_directory_skip_existing(src_base: str, dst_base: str):
    src_base = os.path.abspath(src_base)
    dst_base = os.path.abspath(dst_base)

    for root, dirs, files in os.walk(src_base):
        # Create corresponding path in destination
        relative_path = os.path.relpath(root, src_base)
        dest_dir = os.path.join(dst_base, relative_path)
        os.makedirs(dest_dir, exist_ok=True)

        for file in files:
            src_file = os.path.join(root, file)
            dst_file = os.path.join(dest_dir, file)

            if not os.path.exists(dst_file):
                try:
                    shutil.copy2(src_file, dst_file)
                    print(f"Copied: {src_file} → {dst_file}")
                except Exception as e:
                    print(f"Failed to copy {src_file}: {e}")
            else:
                print(f"Skipped (already exists): {dst_file}")


def replicate_and_copy(file_list_path, source_base, destination_base):
    source_base = Path(source_base).resolve()
    destination_base = Path(destination_base).resolve()

    if not source_base.exists():
        print(f"Source base path does not exist: {source_base}")
        return

    with open(file_list_path, 'r') as f:
        lines = [line.strip() for line in f if line.strip()]

    total = len(lines)
    for idx, full_source_path in enumerate(lines, 1):
        full_source_path = Path(full_source_path).resolve()

        if not full_source_path.exists():
            print(f"[{idx}/{total}] Source does not exist: {full_source_path}")
            continue

        try:
            relative_path = full_source_path.relative_to(source_base)
        except ValueError:
            print(f"[{idx}/{total}] Skipping: {full_source_path} is not under {source_base}")
            continue

        dest_path = destination_base / relative_path
        dest_dir = dest_path.parent
        dest_dir.mkdir(parents=True, exist_ok=True)

        shutil.copy2(full_source_path, dest_path)
        print(f"[{idx}/{total}] Copied: {full_source_path} -> {dest_path}")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Replicate folder structure and copy files.")
    parser.add_argument("file_list_path", help="Text file with source paths (one per line)")
    parser.add_argument("source_base", help="Base directory of the source paths")
    parser.add_argument("destination_base", help="Where to replicate the structure and copy to")

    args = parser.parse_args()

    replicate_and_copy(args.file_list_path, args.source_base, args.destination_base)
