import { useEffect, useState } from "react";
import mammoth from "mammoth";
import Footer from "../Components/Footer";

export default function ContractTemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [previewHtml, setPreviewHtml] = useState("");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/contract/list-templates");
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  const handleExport = async (fileName) => {
    try {
      const res = await fetch(`http://localhost:3000/api/contract/export/${fileName}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract_${fileName}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export contract failed:", err);
    }
  };

  const handlePreview = async (fileName) => {
    try {
      const res = await fetch(`http://localhost:3000/uploads/${fileName}`);
      const arrayBuffer = await res.arrayBuffer();
      const { value } = await mammoth.convertToHtml({ arrayBuffer });

      setPreviewHtml(value);
      setSelected(fileName);
    } catch (err) {
      console.error("Preview failed:", err);
      setPreviewHtml("<p class='text-red-500'>Không thể hiển thị nội dung file.</p>");
      setSelected(fileName);
    }
  };

  return (
    // 👇 Đây là phần chính giúp Footer luôn ở dưới
    <div className="min-h-screen flex flex-col font-poppins">
      <main className="flex-grow p-6">
        <h2 className="text-xl font-bold mb-4 font-lora">
          Pick a suitable template for your contract
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {templates.map((file) => (
            <div
              key={file}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition ${
                selected === file ? "border-blue-500 shadow-lg" : "border-gray-300"
              }`}
              onClick={() => handlePreview(file)}
            >
              <h3 className="font-semibold mb-2 text-gray-800">
                {file.replace(/\.(docx|doc)$/i, "")}
              </h3>
              <p className="text-gray-500 text-sm">📄 {file}</p>
            </div>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-auto">
            <div className="bg-white p-6 rounded-lg max-w-5xl w-full relative">
              <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
                {selected.replace(/\.(docx|doc)$/i, "")}
              </h3>

              <div
                className="border p-6 rounded-lg bg-white text-gray-900 leading-relaxed overflow-auto max-h-[80vh]"
                style={{
                  fontFamily: "Times New Roman, serif",
                  lineHeight: "1.8",
                  fontSize: "15px",
                  whiteSpace: "pre-wrap",
                }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => handleExport(selected)}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Download (.doc)
                </button>

                <button
                  onClick={() => {
                    setSelected(null);
                    setPreviewHtml("");
                  }}
                  className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 👇 Footer luôn ở cuối */}
      <Footer />
    </div>
  );
}
