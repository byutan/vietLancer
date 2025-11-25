import React from "react";
import { DollarSign, CalendarDays, User, FileText } from "lucide-react";

// Định nghĩa Badge component ngay tại đây để tránh lỗi import
const Badge = ({ children, className, variant = "default" }) => {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
};

function BidCard({ bid, onClick }) {
  
  // 1. Hàm chuẩn hóa status để lấy đúng màu
  const getStatusKey = (status) => {
    if (!status) return 'pending';
    const s = status.toLowerCase();

    // Map các từ khóa khác nhau về 3 trạng thái gốc
    if (s === 'accepted' || s === 'approved') return 'approved'; // Màu xanh
    if (s === 'rejected' || s === 'cancelled') return 'rejected'; // Màu đỏ
    return 'pending'; // Màu vàng/đen
  };

  const statusKey = getStatusKey(bid.bid_status);

  // 2. Cấu hình màu sắc
  const statusConfig = {
    pending: { 
        label: "Pending", 
        className: "bg-yellow-500 text-white border-transparent hover:bg-yellow-600" 
    },
    approved: { 
        label: "Approved", 
        className: "bg-green-600 text-white border-transparent hover:bg-green-700" 
    },
    rejected: { 
        label: "Rejected", 
        className: "bg-red-600 text-white border-transparent hover:bg-red-700" 
    },
  };

  const status = statusConfig[statusKey];

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-4 shadow-sm hover:border-black transition-all cursor-pointer flex flex-row items-center min-h-[120px] w-full max-w-full 2xl:max-w-[1600px] xl:max-w-[1200px] lg:max-w-[1000px] md:max-w-[900px] mx-auto my-2"
      onClick={onClick}
    >
      <div className="flex flex-col justify-center flex-1 min-w-0">
        {/* Header: Status & Category */}
        <div className="flex items-center gap-3 mb-1">
          <Badge className={`text-xs px-2 py-0.5 ${status.className}`}>
            {status.label}
          </Badge>
          <Badge variant="outline" className="border-gray-200 text-xs font-semibold text-gray-600 bg-transparent">
            {bid.projectCategory || 'Category'}
          </Badge>
        </div>

        {/* Title & Desc */}
        <h3 className="text-lg font-bold text-gray-900 truncate">
            {bid.projectTitle || 'Project Name'}
        </h3>
        <p className="text-sm text-gray-600 truncate mb-1">
            {bid.projectDescription || ''}
        </p>

        <div className="border-t border-gray-100 my-2" />

        {/* Freelancer Info */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">{bid.freelancer_name}</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 text-xs">{bid.freelancer_email}</span>
        </div>

        {/* Bid Description Preview */}
        <div className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded border border-gray-100 italic line-clamp-1">
            <FileText className="w-3 h-3 inline mr-1 text-gray-400"/>
            {bid.bid_desc}
        </div>

        {/* Footer: Offer & Date */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-gray-500 font-medium">Offer:</span>
            <span className="text-base font-bold text-gray-900 ml-1">
                {typeof bid.price_offer === 'number' ? bid.price_offer.toLocaleString('vi-VN') : bid.price_offer}
            </span>
            <span className="text-xs font-bold text-gray-500 ml-1">VND</span>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium">
              {bid.bid_date ? new Date(bid.bid_date).toLocaleDateString('vi-VN') : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BidCard;