import { useEffect, useState } from "react";
import Footer from "../Components/Footer";
import DocxViewer from "../Components/DocxViewer"; // Giả sử component này bạn đã có

export default function ContractTemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);

  // 1. Fetch danh sách từ DB
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/contract/list-templates");
        const data = await res.json();
        
        // Kiểm tra nếu data là mảng thì set, không thì log lỗi
        if (Array.isArray(data)) {
            setTemplates(data);
        } else {
            console.error("Data format invalid:", data);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      }
    };
    fetchTemplates();
  }, []);

  // 2. Tải file về (Dùng ID)
  const handleExport = async (template) => {
    try {
      // Gọi API export theo ID
      const res = await fetch(`http://localhost:3000/api/contract/export/${template.id}`);
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Tạo link ảo để tải
      const a = document.createElement("a");
      a.href = url;
      a.download = template.name; // Đặt tên file khi tải về
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Export contract failed:", err);
      alert("Cannot download this contract.");
    }
  };

  const handlePreview = (template) => {
    setSelected(template);
  };

  return (
    <div className="min-h-screen flex flex-col font-poppins">
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl font-bold mb-8 font-lora text-gray-800 border-b pb-4">
          Contract Templates Library
        </h2>

        {templates.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No templates found.</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
                <div
                key={template.id}
                className={`border rounded-xl p-6 cursor-pointer transition-all duration-200 bg-white ${
                    selected?.id === template.id 
                    ? "border-blue-500 shadow-lg ring-1 ring-blue-500" 
                    : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                }`}
                onClick={() => handlePreview(template)}
                >
                {/* Icon Word */}
                <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">
                        📄
                    </div>
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        DOCX
                    </span>
                </div>

                <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">
                    {template.style || "Standard Contract"}
                </h3>
                <p className="text-gray-500 text-sm truncate mb-4" title={template.name}>
                    {template.name}
                </p>

                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Tránh kích hoạt preview khi bấm nút download
                        handleExport(template);
                    }}
                    className="w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    Download
                </button>
                </div>
            ))}
            </div>
        )}

        {/* Modal Preview */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full h-[85vh] flex flex-col overflow-hidden">
              
              {/* Header Modal */}
              <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800 truncate max-w-md">
                  {selected.style || selected.name}
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Viewer Content */}
              <div className="flex-grow bg-gray-100 p-4 overflow-hidden">
                 {/* DocxViewer hiển thị file từ đường dẫn tĩnh */}
                 <DocxViewer fileUrl={`http://localhost:3000${selected.url}`} />
              </div>

              {/* Footer Modal */}
              <div className="px-6 py-4 border-t bg-white flex justify-end gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                >
                  Close
                </button>
                <button
                  onClick={() => handleExport(selected)}
                  className="px-5 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition shadow-sm"
                >
                  Download (.docx)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}