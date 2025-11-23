import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../ContextAPI/AuthContext';
import Footer from '../Components/Footer'

const API_URL = "http://localhost:3000/api/projects";

export default function MyProjectPage() {
    const { user } = useContext(AuthContext);
    const clientEmail = user?.email;

    const [clientProjects, setClientProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    const fetchProjects = useCallback(async () => {
        if (!clientEmail) {
            return [];
        }

        try {
            const res = await fetch(API_URL);

            if (!res.ok) {
                throw new Error(`Failed to fetch projects: ${res.statusText}`);
            }

            const data = await res.json();
            const projectData = Array.isArray(data.projects) ? data.projects : [];
            const filteredProjects = projectData.filter(
                project => project.clientEmail && project.clientEmail.trim() === clientEmail.trim()
            );

            return filteredProjects;

        } catch (error) {
            console.error("Error loading projects:", error);
            throw error;
        }
    }, [clientEmail]);

    useEffect(() => {
        const loadProjects = async () => {
            if (!clientEmail) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setFetchError(false);

            try {
                const filteredProjects = await fetchProjects();
                setClientProjects(filteredProjects);
            } catch (error) {
                console.error("Error fetching data:", error);
                setFetchError(true);
                setClientProjects([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, [clientEmail, fetchProjects]);

    // HÀM XỬ LÝ HÀNH ĐỘNG CỦA CLIENT
    const handleClientAction = async (projectId, bidId, action) => {
        
        try {
            let res;
            if (action === 'accept') {
                // HÀNH ĐỘNG "ACCEPT" (THUÊ)
                // Gọi API để thuê (API bạn đã thêm vào projectposting.js)
                res = await fetch(`${API_URL}/${projectId}/hire`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hired_bid_ID: bidId })
                });

            } else {
                // HÀNH ĐỘNG "REJECT" (TỪ CHỐI)
                // Gọi API để reject (API bạn đã thêm vào bid.js)
                res = await fetch(`${API_URL}/${projectId}/bids/${bidId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client_status: 'client_rejected' }) // Biến mới
                });
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Failed to ${action} bid`);
            }

            // Cập nhật state ở local (frontend)
            setClientProjects(prevProjects => {
                return prevProjects.map(project => {
                    if (project.id === projectId) {
                        
                        if (action === 'accept') {
                            // Nếu "Accept", cập nhật toàn bộ project
                            return {
                                ...project,
                                status: 'in_progress', // Cập nhật trạng thái dự án
                                hired_bid_ID: bidId   // Lưu ID của bid đã thuê
                            };
                        } else {
                            // Nếu "Reject", chỉ cập nhật bid đó
                            const updatedBids = project.list_of_bid.map(bid => {
                                if (bid.bid_ID === bidId) {
                                    // Thêm biến mới để lọc ra ở giao diện
                                    return { ...bid, client_status: 'client_rejected' };
                                }
                                return bid;
                            });
                            return { ...project, list_of_bid: updatedBids };
                        }
                    }
                    return project;
                });
            });

            console.log(`Client successfully ${action}ed bid ${bidId}`);

        } catch (error) {
            console.error(`Error ${action}ing bid:`, error);
            alert(`Error: ${error.message}`);
        }
    };


    if (!user || (user.role !== 'client' && user.role !== 'moderator')) {
        return (
            <div className="p-8 text-center text-xl font-semibold">
                Unauthorized access.
            </div>
        );
    }

    if (isLoading) {
        return <div className="p-8 text-center text-xl">Loading projects...</div>;
    }

    if (fetchError) {
        return (
            <div className="p-8 text-center text-xl text-red-600 font-semibold">
                Error connecting API.
            </div>
        );
    }

    if (clientProjects.length === 0) {
        return (
            <div className="p-8 text-center text-xl font-semibold">
                No available projects.
            </div>
        );
    }

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return amount;
        return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
    };

    return (
        <>
            <div className="max-w-7xl mx-auto p-8 font-poppins">
                <h1 className="text-4xl font-bold mb-10 text-gray-800">
                    My projects
                </h1>

                <hr className="mb-8" />

                {clientProjects.map(project => {
                    
                    // -----------------------------------------------------------------
                    // ĐÂY LÀ DÒNG ĐÃ SỬA LỖI
                    // -----------------------------------------------------------------
                    // Kiểm tra status bằng .toLowerCase() để xử lý cả "IN_PROGRESS" và "in_progress"
                    const isHired = project.status && project.status.toLowerCase() === 'in_progress';
                    // -----------------------------------------------------------------

                    const hiredBidId = project.hired_bid_ID;

                    // 2. Lọc ra các bid sẽ hiển thị
                    const visibleBids = project.list_of_bid
                        ? project.list_of_bid.filter(bid => {
                            // Điều kiện 1: Bid phải được Admin accepted
                            const isAdminAccepted = bid.bid_status === 'accepted';
                            
                            // Điều kiện 2: Bid không bị Client rejected
                            const isNotClientRejected = bid.client_status !== 'client_rejected';

                            if (isHired) {
                                // Nếu đã thuê, chỉ hiện người được thuê
                                return bid.bid_ID === hiredBidId;
                            } else {
                                // Nếu chưa thuê, hiện các bid (Admin đã accept) VÀ (Client chưa reject)
                                return isAdminAccepted && isNotClientRejected;
                            }
                        })
                        : [];

                    return (
                        <div key={project.id} className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-200">

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h2>
                            <p className="text-gray-600 mb-4">{project.description}</p>

                            <div className="flex flex-wrap gap-4 items-center mb-6 text-sm font-medium">
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                    Budget: {formatCurrency(project.budget)}
                                </span>
                                <span className={`px-3 py-1 rounded-full ${project.status && (project.status.toLowerCase() === 'approved' || project.status.toLowerCase() === 'in_progress') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    Project status: {project.status ? project.status.toUpperCase() : 'UNKNOWN'}
                                </span>
                            </div>

                            <h3 className="text-xl font-semibold mt-6 mb-4 border-t pt-4">
                                {/* Đổi tiêu đề dựa trên trạng thái project */}
                                {isHired ? 'Hired Freelancer' : `Freelancer proposal (${visibleBids.length} bids)`}
                            </h3>

                            {visibleBids.length === 0 ? (
                                <p className="italic text-gray-500">
                                    {isHired
                                        ? 'No hired freelancer information found.'
                                        : 'No bids (approved by Admin) are available.'}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {visibleBids.map(bid => (
                                        <div key={bid.bid_ID} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-lg text-gray-700">{bid.freelancer_name}</div>
                                                <div className="text-sm text-gray-500 mb-2">Email: {bid.freelancer_email}</div>
                                                
                                                <p className="text-gray-800 line-clamp-2 mb-2">
                                                        Proposal: {bid.bid_desc}
                                                </p>

                                                <div className="font-semibold text-orange-600">
                                                    Proposing price: {formatCurrency(bid.price_offer)}
                                                </div>
                                            </div>

                                            <div className="ml-4 flex flex-col items-end space-y-2 flex-shrink-0">
                                                
                                                {/* Nếu project chưa hire ai */}
                                                {!isHired && (
                                                    <>
                                                        <button
                                                            onClick={() => handleClientAction(project.id, bid.bid_ID, 'accept')}
                                                            className="bg-green-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-green-700 transition duration-150 shadow-md w-32 text-center"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleClientAction(project.id, bid.bid_ID, 'reject')}
                                                            className="bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-700 transition duration-150 shadow-md w-32 text-center"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}

                                                {/* Nếu project đã hire và đây là bid được hire */}
                                                {isHired && bid.bid_ID === hiredBidId && (
                                                    <span className="font-semibold text-green-700 bg-green-100 px-4 py-2 rounded-lg">
                                                        Hired
                                                    </span>
                                                )}
                                            </div>
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