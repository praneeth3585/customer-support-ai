from pypdf import PdfReader

reader = PdfReader("documents/FAQ.pdf")

print("Pages:", len(reader.pages))

for page in reader.pages:
    print(page.extract_text())