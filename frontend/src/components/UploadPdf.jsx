import { useState } from "react";

function UploadPdf() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setMessage(
        data.message ||
        "PDF uploaded successfully"
      );

    } catch (error) {
      console.error(error);

      setMessage(
        "Upload failed. Please try again."
      );

    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Upload Knowledge Base PDF
      </h2>

      <div className="flex flex-col gap-4">

        <input
          type="file"
          accept=".pdf"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
          className="border p-3 rounded-lg"
        />

        {file && (
          <div className="bg-slate-100 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Selected File
            </p>

            <p className="font-medium">
              {file.name}
            </p>
          </div>
        )}

        <button
          onClick={uploadFile}
          disabled={uploading}
          className={`px-4 py-3 rounded-lg text-white ${
            uploading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading
            ? "Uploading..."
            : "Upload PDF"}
        </button>

        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.toLowerCase().includes(
                "failed"
              )
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

      </div>
    </div>
  );
}

export default UploadPdf;