import React from "react";
import { Badge } from "./ui/badge"; // Lưu ý: Kiểm tra lại đường dẫn import Badge nếu báo lỗi
import { DollarSign, CalendarDays, User } from "lucide-react";

function ProjectCard({ project, onClick }) {
  
  // 1. Hàm chuẩn hóa status về chữ thường để dễ so sánh
  const getStatusKey = (status) => {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    
    // Map trạng thái từ DB (MySQL) sang Key cấu hình bên dưới
    if (s === 'open' || s === 'in progress') return 'approved'; // Đã duyệt -> Hiện màu xanh
    if (s === 'cancelled' || s === 'rejected') return 'rejected'; // Từ chối -> Hiện màu đỏ
    return 'pending'; // Mặc định là chờ duyệt
  };

  // 2. Cấu hình hiển thị (Màu sắc & Label)
  const statusConfig = {
    pending: { 
      label: "Pending", 
      variant: "default", 
      className: "bg-yellow-500 text-white border-none" // Đổi sang màu vàng cho đúng ý nghĩa "Chờ"
    },
    approved: { 
      label: "Approved", 
      variant: "default", 
      className: "bg-green-600 text-white border-none" 
    },
    rejected: { 
      label: "Rejected", 
      variant: "default", 
      className: "bg-red-600 text-white border-none" 
    },
  };

  const statusKey = getStatusKey(project.status);
  const status = statusConfig[statusKey];

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-4 shadow-sm hover:border-black transition-all cursor-pointer flex flex-row items-center min-h-[120px] w-full max-w-full 2xl:max-w-[1600px] xl:max-w-[1200px] lg:max-w-[1000px] md:max-w-[900px] mx-auto my-2"
      onClick={onClick}
    >
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          {/* Badge Status */}
          <Badge variant={status.variant} className={`text-xs px-2 py-0.5 ${status.className || ""}`}>
            {status.label}
          </Badge>
          
          {/* Badge Category */}
          <Badge variant="outline" className="border border-gray-200 text-xs font-semibold text-gray-600">
            {project.category}
          </Badge>
        </div>

        <h3 className="text-lg font-bold text-gray-900 truncate">{project.title}</h3>
        <p className="text-sm text-gray-600 truncate mb-1">{project.description}</p>

        {/* Skills row */}
        {Array.isArray(project.skills) && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {project.skills.map((skill, idx) => (
              <span key={idx} className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium border border-gray-200">
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 my-2" />

        {/* Footer Info */}
        <div className="flex items-center justify-between mt-1">
          {/* Client Name */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium truncate max-w-[150px]">
              {project.clientName || "Unknown Client"}
            </span>
          </div>

          {/* Budget & Date */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <DollarSign className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-semibold text-gray-900">
                {typeof project.budget === 'number' ? project.budget.toLocaleString('vi-VN') : project.budget}
              </span>
              <span className="text-[10px] font-medium text-gray-500">VND</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-medium text-gray-500">
                {project.createdAt ? new Date(project.createdAt).toLocaleDateString('vi-VN') : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;