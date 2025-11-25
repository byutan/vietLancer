import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import AuthContext from '../ContextAPI/AuthContext';
import Footer from '../Components/Footer';
import { Search, Filter, ArrowUpDown, CheckCircle } from 'lucide-react';

export default function MyProjectPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const clientEmail = user?.email;

    const [clientProjects, setClientProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🔍 State cho bộ lọc
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortOrder, setSortOrder] = useState("newest");

    // 1. Gọi API lấy dự án
    const fetchProjects = useCallback(async () => {
        if (!clientEmail) return;
        try {
            const res = await fetch(`http://localhost:3000/api/projects/client/${clientEmail}`, {
                headers: { 
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            const data = await res.json();
            if (data.success) {
                setClientProjects(data.projects);
            }
        } catch (error) {
            console.error("Error loading projects:", error);
        } finally {
            setIsLoading(false);
        }
    }, [clientEmail]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // 🔍 LOGIC LỌC VÀ SẮP XẾP
    const filteredProjects = clientProjects.filter(project => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = project.title?.toLowerCase().includes(term) || 
                              project.description?.toLowerCase().includes(term);

        let matchesStatus = true;
        
        const statusLower = project.status ? project.status.toLowerCase() : '';
        const isCompleted = statusLower === 'completed';
        const isHired = !isCompleted && (statusLower === 'in progress' || !!project.hired_bid_ID);
        
        if (statusFilter !== "All") {
            if (statusFilter === "In Progress") matchesStatus = isHired;
            else if (statusFilter === "Open") matchesStatus = !isHired && !isCompleted && statusLower === 'open';
            else if (statusFilter === "Completed") matchesStatus = isCompleted;
            else matchesStatus = statusLower === statusFilter.toLowerCase();
        }

        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt).getTime();
        const dateB = new Date(b.created_at || b.createdAt).getTime();
        if (sortOrder === "newest") return dateB - dateA;
        return dateA - dateB;
    });

    const handleClientAction = async (projectId, bidId, action) => {
        try {
            if (action === 'accept') {
                await fetch(`http://localhost:3000/api/projects/${projectId}/hire`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hired_bid_ID: bidId })
                });
                navigate('/ContractTemplatePage', { state: { projectId, bidId } });
            } else {
                await fetch(`http://localhost:3000/api/projects/${projectId}/bids/${bidId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client_status: 'client_rejected' })
                });
                fetchProjects();
            }
        } catch (error) {
            console.error(`Error ${action}ing bid:`, error);
            alert(`Error: ${error.message}`);
        }
    };

    // 🔥 HÀM MỚI: Đánh dấu hoàn thành
    const handleCompleteProject = async (projectId) => {
        if (!window.confirm("Are you sure you want to mark this project as Completed? This action cannot be undone.")) return;

        try {
            const res = await fetch(`http://localhost:3000/api/projects/${projectId}/complete`, {
                method: 'PATCH'
            });

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("API not found or Server Error. Please restart Backend.");
            }

            const data = await res.json();
            
            if (data.success) {
                alert("Project completed successfully!");
                fetchProjects();
            } else {
                alert(data.message || "Failed to complete project");
            }
        } catch (error) {
            console.error("Error completing project:", error);
            alert("Error: " + error.message);
        }
    };

    const formatCurrency = (amount) => {
        const num = Number(amount);
        if (isNaN(num)) return amount;
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
    };

    if (!user || (user.role !== 'client' && user.role !== 'moderator')) {
        return <div className="p-8 text-center text-xl">Unauthorized access.</div>;
    }

    if (isLoading) return <div className="p-8 text-center text-xl">Loading projects...</div>;

    return (
        <>
            <div className="max-w-7xl mx-auto p-8 font-poppins min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b pb-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-gray-800 font-lora">My Projects</h1>
                        <p className="text-gray-500">Manage your posted projects and hire freelancers.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input 
                                type="text" 
                                placeholder="Search project title..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            />
                        </div>

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
                                <option value="Pending">Pending</option>
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

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

                {filteredProjects.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-xl font-semibold text-gray-500">
                            {searchTerm || statusFilter !== "All" ? "No matching projects found." : "You haven't posted any projects yet."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {filteredProjects.map(project => {
                            // Logic xác định trạng thái
                            const statusLower = project.status ? project.status.toLowerCase() : '';
                            const isCompleted = statusLower === 'completed';
                            const isHired = !isCompleted && (statusLower === 'in progress' || !!project.hired_bid_ID);
                            const hiredBidId = project.hired_bid_ID;

                            const visibleBids = (project.list_of_bid || []).filter(bid => {
                                const bidStatus = bid.bid_status ? bid.bid_status.toLowerCase() : '';
                                const isAccepted = bidStatus === 'accepted'; 
                                const isRejected = bidStatus === 'rejected';

                                // ⚡ FIX QUAN TRỌNG:
                                // Nếu dự án đã thuê/hoàn thành, hiện bất kỳ bid nào là 'accepted' (hoặc khớp ID)
                                // Điều này đảm bảo tên freelancer luôn hiện kể cả khi ID bị lỗi format
                                if (isHired || isCompleted) {
                                    return String(bid.bid_ID) === String(hiredBidId) || isAccepted;
                                }

                                // Nếu dự án đang Open: Hiện tất cả bid chưa bị từ chối (bao gồm cả Pending)
                                return !isRejected;
                            });

                            return (
                                <div key={project.id} className={`bg-white shadow-lg rounded-xl p-6 border transition-all hover:shadow-xl ${isCompleted ? 'border-gray-300 opacity-90' : 'border-gray-200'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
                                        
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                isCompleted ? 'bg-gray-600 text-white' :
                                                isHired ? 'bg-blue-100 text-blue-800' : 
                                                project.status === 'Open' ? 'bg-green-100 text-green-800' :
                                                project.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {isCompleted ? 'Completed' : isHired ? 'In Progress' : project.status}
                                            </span>

                                            {isHired && !isCompleted && (
                                                <button 
                                                    onClick={() => handleCompleteProject(project.id)}
                                                    className="flex items-center gap-1 bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800 text-sm font-medium transition-colors shadow-sm"
                                                    title="Mark project as finished"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Finish
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                                    
                                    <div className="flex flex-wrap gap-4 items-center mb-6 text-sm font-medium">
                                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200">
                                            Budget: <span className="font-bold text-green-700">{formatCurrency(project.budget)}</span>
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            Posted: {new Date(project.created_at || project.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold mt-6 mb-4 border-t pt-4 flex items-center justify-between">
                                        <span>{isHired || isCompleted ? 'Hired Freelancer' : 'Freelancer Proposals'}</span>
                                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                            {visibleBids.length} {visibleBids.length === 1 ? 'candidate' : 'candidates'}
                                        </span>
                                    </h3>

                                    {visibleBids.length === 0 ? (
                                        <div className="p-4 bg-gray-50 rounded-lg text-center border border-gray-100">
                                            <p className="italic text-gray-500 text-sm">
                                                {(isHired || isCompleted) ? 'Freelancer info unavailable.' : 'No active proposals yet.'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {visibleBids.map(bid => (
                                                <div key={bid.bid_ID} className={`p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start gap-4 ${(isHired || isCompleted) ? 'bg-blue-50 border-blue-200' : 'bg-white hover:border-blue-300 transition-colors'}`}>
                                                    <div className="flex-1">
                                                        <div className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                                            {bid.freelancer_name}
                                                            {(isHired || isCompleted) && <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">Hired</span>}
                                                        </div>
                                                        <div className="text-sm text-gray-500 mb-2">{bid.freelancer_email}</div>
                                                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 italic mb-2 border border-gray-100">
                                                            "{bid.bid_desc}"
                                                        </div>
                                                        <div className="font-bold text-green-600">Offer: {formatCurrency(bid.price_offer)}</div>
                                                    </div>
                                                    
                                                    {/* Chỉ hiện nút Accept/Reject khi CHƯA thuê ai và CHƯA hoàn thành */}
                                                    {!isHired && !isCompleted && (
                                                        <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                                                            <button 
                                                                onClick={() => handleClientAction(project.id, bid.bid_ID, 'accept')}
                                                                className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 w-full sm:w-32 shadow-sm transition-all active:scale-95"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button 
                                                                onClick={() => handleClientAction(project.id, bid.bid_ID, 'reject')}
                                                                className="bg-white text-red-600 border border-red-200 font-medium py-2 px-4 rounded-lg hover:bg-red-50 w-full sm:w-32 shadow-sm transition-all active:scale-95"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}