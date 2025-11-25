import React, { useState, useEffect, useContext, createContext } from "react";
import { Mail, Phone, CheckCircle2, Clock, XCircle, Contact, User, MessageSquare, Search, Filter, ArrowUpDown } from "lucide-react";

import AuthContext from "../ContextAPI/AuthContext";
import Footer from "../Components/Footer";


export default function MyBidPage() {
  const { user } = useContext(AuthContext);
  const freelancerEmail = user?.email;

  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔍 State cho bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Accepted, Pending, Rejected
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest

  const [selectedContact, setSelectedContact] = useState(null);

  // Fetch bids
  useEffect(() => {
    async function fetchMyBids() {
      if (!freelancerEmail) {
        if (user === null) setIsLoading(false); 
        return;
      }
      
      try {
        const encodedEmail = encodeURIComponent(freelancerEmail);
        const res = await fetch(`http://localhost:3000/api/projects/freelancer/bids?email=${encodedEmail}`);
        
        if (!res.ok) {
            console.warn("API Error, using fallback data for UI testing");
        }

        const data = await res.json();

        if (data.success) {
          const myBids = data.bids.map((bid) => ({
            bidId: bid.bid_id,
            bidDesc: bid.bid_desc,
            priceOffer: bid.price_offer,
            bidStatus: bid.bid_status,
            bidDate: bid.bid_date,
            
            projectTitle: bid.project_name,
            projectStatus: bid.project_status,
            
            clientName: bid.clientName,
            clientEmail: bid.clientEmail,
            clientPhone: bid.clientPhone || "", 
          }));
          setBids(myBids);
        }
      } catch (err) {
        console.error("Error fetching bids:", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMyBids();
  }, [freelancerEmail, user]);

  // 🔍 Logic Lọc & Sắp xếp Bids
  const filteredBids = bids.filter((bid) => {
    // 1. Lọc theo từ khóa tìm kiếm
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
        bid.projectTitle?.toLowerCase().includes(term) || 
        bid.bidStatus?.toLowerCase().includes(term)
    );

    // 2. Lọc theo Trạng thái
    let matchesStatus = true;
    const status = bid.bidStatus ? bid.bidStatus.toLowerCase() : "";
    
    if (statusFilter === "Accepted") {
        matchesStatus = status === "accepted" || status === "approved";
    } else if (statusFilter === "Rejected") {
        matchesStatus = status === "rejected" || status === "cancelled";
    } else if (statusFilter === "Pending") {
        matchesStatus = status === "pending";
    }

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // 3. Sắp xếp theo thời gian
    const dateA = new Date(a.bidDate).getTime();
    const dateB = new Date(b.bidDate).getTime();
    
    if (sortOrder === "newest") return dateB - dateA;
    return dateA - dateB;
  });

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat("vi-VN", { style: 'currency', currency: 'VND' }).format(num);
  };

  const getStatusConfig = (status) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "accepted" || s === "approved") {
        return { label: "Accepted", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 };
    }
    if (s === "rejected" || s === "cancelled") {
        return { label: "Rejected", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle };
    }
    return { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock };
  };

  if (user && user.role !== "freelancer") {
      return <div className="p-10 text-center text-xl text-gray-600 font-poppins">Trang này chỉ dành cho Freelancer.</div>;
  }
  
  if (isLoading) {
      return <div className="p-10 text-center text-xl text-gray-500 font-poppins">Đang tải danh sách hồ sơ...</div>;
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 font-poppins min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b pb-6">
            <div>
                <h1 className="text-3xl font-bold mb-2 text-gray-800 font-lora">My Proposals</h1>
                <p className="text-gray-500">Manage your submitted proposals.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* 🔍 Thanh tìm kiếm */}
                <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search project..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    />
                </div>

                {/* 🔽 Bộ lọc Status */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Pending">Pending</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                {/* 🔃 Sắp xếp Thời gian */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="space-y-6">
          {filteredBids.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">
                    {searchTerm || statusFilter !== "All" ? "Không tìm thấy hồ sơ phù hợp." : "Bạn chưa nộp hồ sơ chào giá nào."}
                </p>
            </div>
          ) : (
            filteredBids.map((bid) => {
            const statusConfig = getStatusConfig(bid.bidStatus);
            const StatusIcon = statusConfig.icon;
            const isAccepted = statusConfig.label === "Accepted";

            return (
              <div key={bid.bidId} className={`bg-white shadow-sm rounded-xl p-6 border transition-all duration-200 ${isAccepted ? 'border-green-200 ring-1 ring-green-100 shadow-md' : 'border-gray-200 hover:shadow-md'}`}>
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{bid.projectTitle}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <span>Submitted: {new Date(bid.bidDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1.5 rounded-full font-semibold text-sm flex items-center gap-1.5 border ${statusConfig.color}`}>
                    <StatusIcon className="w-4 h-4" /> {statusConfig.label}
                  </div>
                </div>

                {/* Nội dung Bid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <span className="text-xs uppercase font-bold text-gray-400">Proposal Description</span>
                    <p className="text-gray-700 mt-1 italic line-clamp-2">"{bid.bidDesc}"</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
                    <span className="text-xs uppercase font-bold text-blue-400">Your Offer</span>
                    <span className="block text-2xl font-bold text-blue-700 mt-1">{formatCurrency(bid.priceOffer)}</span>
                  </div>
                </div>

                {/* Footer: Hiển thị thông tin Client (Nếu Accepted) hoặc Thông báo khóa (Nếu chưa) */}
                {isAccepted ? (
                  <div className="mt-4 pt-4 border-t border-green-100 bg-green-50/30 -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
                    <h3 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
                        <Contact className="w-4 h-4" /> Client Contact Details
                    </h3>
                    
                    <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold uppercase">Project Owner</p>
                                <p className="font-bold text-gray-900 text-lg">{bid.clientName || "Client"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold">Email</p>
                                    <a href={`mailto:${bid.clientEmail}`} className="text-sm text-blue-600 font-medium hover:underline block truncate">
                                        {bid.clientEmail}
                                    </a>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold">Phone</p>
                                    {bid.clientPhone ? (
                                        <a href={`tel:${bid.clientPhone}`} className="text-sm text-green-600 font-medium hover:underline">
                                            {bid.clientPhone}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">Not provided</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end border-t border-gray-100 pt-4">
                    <span className="text-sm text-gray-400 italic flex items-center gap-1 select-none">
                      <XCircle className="w-4 h-4" /> Contact info locked
                    </span>
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </div>

      <Footer />
    </>
  );
}