import React from "react";
import Badge from "./ui/badge";
import { DollarSign, CalendarDays, User, FileText } from "lucide-react";

function BidCard({ bid, onClick }) {
  // Status config for badge
  const statusConfig = {
    pending: { label: "Pending", className: "bg-black text-white" },
    approved: { label: "Approved", className: "bg-green-600 text-white" },
    rejected: { label: "Rejected", className: "bg-red-600 text-white" },
  };
  const status = statusConfig[bid.bid_status] || statusConfig.pending;

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-4 shadow-sm hover:border-black transition-all cursor-pointer flex flex-row items-center min-h-[120px] w-full max-w-full 2xl:max-w-[1600px] xl:max-w-[1200px] lg:max-w-[1000px] md:max-w-[900px] mx-auto my-2"
      onClick={onClick}
    >
      <div className="flex flex-col justify-center flex-1 min-w-0">
        {/* Status and Category Badges */}
        <div className="flex items-center gap-3 mb-1">
          <Badge className={`text-xs ${status.className}`}>{status.label}</Badge>
          <Badge variant="outline" className="border border-gray-200 text-xs font-semibold">
            {bid.projectCategory || 'Category'}
          </Badge>
        </div>
        {/* Project Title */}
        <h3 className="text-lg font-bold text-gray-900 truncate">{bid.projectTitle || 'Project'}</h3>
        {/* Project Description */}
        <p className="text-sm text-gray-600 truncate mb-1">{bid.projectDescription || ''}</p>
        <div className="border-t border-gray-300 my-2" />
        {/* Freelancer Name & Email */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">{bid.freelancer_name}</span>
          <span className="text-gray-500">|</span>
          <span className="font-semibold text-gray-900">{bid.freelancer_email}</span>
        </div>
        {/* Bid Description */}
        <div className="text-sm text-gray-600 mb-1">{bid.bid_desc}</div>
        {/* Bid Offer (left) and Bid Date (right) */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-sm text-gray-500 font-semibold">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span>Offer:</span>
            <span className="text-base font-bold text-gray-900 ml-1">{typeof bid.price_offer === 'number' ? bid.price_offer.toLocaleString('vi-VN') : bid.price_offer}</span>
            <span className="text-base font-bold text-gray-900 ml-1">VND</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 font-semibold">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            <span>Bid Date:</span>
            <span className="text-base font-bold text-gray-900 ml-1">
              {bid.bid_date ? new Date(bid.bid_date).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default BidCard;
