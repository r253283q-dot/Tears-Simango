import os
import zipfile

def create_zip():
    app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(app_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)
    output_zip = os.path.join(public_dir, 'zimbabwe-sentiment-app.zip')

    exclude_dirs = {'node_modules', '.git', '.cache', 'dist', '.npm', '.yarn', '__pycache__', '.aistudio'}
    exclude_files = {'bun.lock', '.DS_Store'}

    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(app_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if file in exclude_files or file.endswith('.zip'):
                    continue
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, app_dir)
                zipf.write(abs_path, rel_path)

    print(f"Zip created at {output_zip}, size: {os.path.getsize(output_zip)} bytes")

if __name__ == '__main__':
    create_zip()
