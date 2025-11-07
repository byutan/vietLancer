import { useEffect, useRef } from "react";
import { renderAsync } from "docx-preview";

export default function DocxViewer({ fileUrl }) {
  const containerRef = useRef();

  useEffect(() => {
    if (!fileUrl) return;
    fetch(fileUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => renderAsync(buffer, containerRef.current))
      .catch(err => console.error("Preview error:", err));
  }, [fileUrl]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[80vh] overflow-auto bg-white p-6 rounded-lg shadow-inner"
    ></div>
  );
}
