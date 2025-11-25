import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import AuthContext from '../ContextAPI/AuthContext';
import Footer from '../Components/Footer';

export default function MyProjectPage() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const clientEmail = user?.email;

    const [clientProjects, setClientProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ CẬP NHẬT 1: Gọi API chuyên biệt mới tạo
    const fetchProjects = useCallback(async () => {
        if (!clientEmail) return;
        try {
            const res = await fetch(`http://localhost:3000/api/projects/client/${clientEmail}`);
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

    const handleClientAction = async (projectId, bidId, action) => {
        try {
            if (action === 'accept') {
                await fetch(`http://localhost:3000/api/projects/${projectId}/hire`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hired_bid_ID: bidId })
                });
                // Chuyển trang sau khi thuê thành công
                navigate('/ContractTemplatePage', { state: { projectId, bidId } });
            } else {
                // Reject bid
                await fetch(`http://localhost:3000/api/projects/${projectId}/bids/${bidId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client_status: 'client_rejected' })
                });
                // Refresh lại dữ liệu sau khi hành động
                fetchProjects();
            }
        } catch (error) {
            console.error(`Error ${action}ing bid:`, error);
            alert(`Error: ${error.message}`);
        }
    };

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return amount;
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
    };

    if (!user || (user.role !== 'client' && user.role !== 'moderator')) {
        return <div className="p-8 text-center text-xl">Unauthorized access.</div>;
    }

    if (isLoading) return <div className="p-8 text-center text-xl">Loading projects...</div>;

    if (clientProjects.length === 0) {
        return <div className="p-8 text-center text-xl">No available projects.</div>;
    }

    return (
        <>
            <div className="max-w-7xl mx-auto p-8 font-poppins min-h-screen">
                <h1 className="text-4xl font-bold mb-10 text-gray-800 font-lora">My Projects</h1>
                <hr className="mb-8" />

                {clientProjects.map(project => {
                    // ✅ Logic check Status (MySQL trả về 'In Progress' hoặc 'Open')
                    const isHired = project.status && project.status.toLowerCase() === 'in_progress';
                    const hiredBidId = project.hired_bid_ID;

                    // Lọc danh sách Bid để hiển thị
                    const visibleBids = (project.list_of_bid || []).filter(bid => {
                        const isAccepted = bid.bid_status === 'Accepted'; // Database MySQL status
                        const isRejected = bid.bid_status === 'Rejected'; // Database MySQL status
                        
                        // Nếu đã thuê, chỉ hiện người được thuê
                        if (isHired) return bid.bid_ID === hiredBidId;
                        
                        // Nếu chưa thuê, hiện những người đã được Admin duyệt (Accepted) và chưa bị Client từ chối
                        // Logic MySQL: Bid Status 'Accepted' nghĩa là Admin duyệt. 
                        // Nếu Client từ chối thì ta đổi status thành 'Rejected' -> nên lọc bỏ Rejected.
                        return isAccepted && !isRejected;
                    });

                    return (
                        <div key={project.id} className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2>
                            <p className="text-gray-600 mb-4">{project.description}</p>
                            
                            <div className="flex flex-wrap gap-4 items-center mb-6 text-sm font-medium">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                    Budget: {formatCurrency(project.budget)}
                                </span>
                                <span className={`px-3 py-1 rounded-full ${project.status === 'Open' || project.status === 'In Progress' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    Status: {project.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-semibold mt-6 mb-4 border-t pt-4">
                                {isHired ? 'Hired Freelancer' : `Freelancer Proposals (${visibleBids.length})`}
                            </h3>

                            {visibleBids.length === 0 ? (
                                <p className="italic text-gray-500">No active proposals.</p>
                            ) : (
                                <div className="space-y-4">
                                    {visibleBids.map(bid => (
                                        <div key={bid.bid_ID} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="font-bold text-lg text-gray-700">{bid.freelancer_name}</div>
                                                <div className="text-sm text-gray-500 mb-2">Email: {bid.freelancer_email}</div>
                                                <p className="text-gray-800 mb-2">Proposal: {bid.bid_desc}</p>
                                                <div className="font-semibold text-orange-600">Offer: {formatCurrency(bid.price_offer)}</div>
                                            </div>
                                            
                                            {!isHired && (
                                                <div className="ml-4 flex flex-col gap-2">
                                                    <button 
                                                        onClick={() => handleClientAction(project.id, bid.bid_ID, 'accept')}
                                                        className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 w-32"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button 
                                                        onClick={() => handleClientAction(project.id, bid.bid_ID, 'reject')}
                                                        className="bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 w-32"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {isHired && (
                                                <span className="font-semibold text-green-700 bg-green-100 px-4 py-2 rounded-lg">Hired</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <Footer />
        </>
    );
}