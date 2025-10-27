import React from "react";
import Badge from "./ui/badge";
import { DollarSign, Clock, User } from "lucide-react";
import { Separator } from './ui/separator';


function ProjectCard({ project, onClick }) {
  // const statusConfig = {
  //   pending: { label: "Pending", variant: "default", className: "bg-black text-white" },
  //   approved: { label: "Approved", variant: "default", className: "bg-green-600 text-white" },
  //   rejected: { label: "Rejected", variant: "default", className: "bg-red-600 text-white" },
  // };
  // const status = statusConfig[project.status] || statusConfig.pending;

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl px-4 sm:px-6 py-4 shadow-sm hover:border-black transition-all cursor-pointer flex flex-row items-center min-h-[120px] w-full max-w-full 2xl:max-w-[1600px] xl:max-w-[1200px] lg:max-w-[1000px] md:max-w-[900px] mx-auto my-2"
      onClick={onClick}
    >
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          {/* <Badge variant={status.variant} className={`text-xs ${status.className || ""}`}>{status.label}</Badge> */}
          <Badge variant="outline" className="border border-gray-200 text-xs font-semibold">{project.category}</Badge>
        </div>
        <h3 className="text-lg font-bold text-gray-900 truncate">{project.title}</h3>
        <p className="text-sm text-gray-600 truncate mb-1">{project.description}</p>
        {/* Skills row */}
        {Array.isArray(project.skills) && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {project.skills.map((skill, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold border border-gray-200">{skill}</span>
            ))}
          </div>
        )}
        <div className="my-2">{/* Adjust 'my-3' to your desired spacing (e.g., my-2, my-4, etc.) */}
          <Separator className="bg-gray-200" />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
          <User className="w-4 h-4 text-gray-400" />
          <span className="flex items-center gap-1 text-sm text-gray-500 font-semibold">{project.clientName}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-sm text-gray-500 font-semibold">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span>Budget:</span>
            <span className="text-base font-bold text-gray-900 ml-1">{typeof project.budget === 'number' ? project.budget.toLocaleString('vi-VN') : project.budget}</span>
            <span className="text-base font-bold text-gray-900 ml-1">VND</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500 font-semibold">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Bidding time left:</span>
            <span className="text-base font-bold text-gray-900 ml-1">
              {(() => {
                // Use updatedAt if available, else fallback to createdAt
                const countdownStart = project.updatedAt || project.createdAt;
                if (!countdownStart) return "N/A";
                const endTime = new Date(countdownStart);
                endTime.setDate(endTime.getDate() + 7);
                const now = new Date();
                const diff = endTime - now;
                if (diff <= 0) return "Expired";
                // Calculate days, hours, minutes left
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / (1000 * 60)) % 60);
                let result = "";
                if (days > 0) result += `${days} days `;
                if (hours > 0) result += `${hours} hours `;
                if (minutes > 0) result += `${minutes} minutes`;
                return result.trim() || "< 1 minute";
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

}
export default ProjectCard;
