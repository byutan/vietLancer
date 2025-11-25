import { useState, useMemo, useEffect, useCallback, useContext } from "react";
import AuthContext from "../ContextAPI/AuthContext";
import BidDetailModal from "../Components/bid-detail-modal";
import BidCard from "../Components/bid-card";
import { useNavigate } from "react-router-dom";
import { Badge } from "../Components/ui/badge";
import { FileText, CheckCircle2, XCircle, Search } from "lucide-react";
import Footer from "../Components/Footer";

const STATUS_OPTIONS = [
    { value: "pending", label: "Pending", icon: FileText, color: "bg-yellow-500" },
    { value: "approved", label: "Approved", icon: CheckCircle2, color: "bg-green-500" },
    { value: "rejected", label: "Rejected", icon: XCircle, color: "bg-red-500" },
];

export default function ApproveBid() {
    const [bids, setBids] = useState([]);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    useEffect(() => {
        if (user && user.role !== 'moderator') {
            navigate("/HomePage"); 
            alert("Bạn không có quyền truy cập trang này!");
        }
    }, [user, navigate]);
    // Fetch all projects, then flatten all bids with project info
    const fetchBids = useCallback(async () => {
        if (!user || user.role !== 'moderator') return;
        try {
            const res = await fetch("http://localhost:3000/api/projects");
            const data = await res.json();
            if (data.success && Array.isArray(data.projects)) {
                // Chỉ lấy các bid thuộc project mà client hiện tại sở hữu
                const allBids = data.projects
                    // .filter(project => user && project.clientEmail === user.email)
                    .flatMap(project =>
                        (project.list_of_bid || []).map(bid => ({
                            ...bid,
                            bid_status: bid.bid_status === 'accepted' ? 'approved' : bid.bid_status,
                            project_id: project.id,
                            projectTitle: project.title,
                            projectDescription: project.description,
                            projectCategory: project.category,
                            projectSkills: project.skills,
                            projectPaymentMethod: project.paymentMethod,
                            projectWorkForm: project.workForm,
                            projectStatus: project.status,
                            projectClient: project.clientName,
                            projectClientEmail: project.clientEmail,
                            projectBudget: project.budget,
                            projectCreatedAt: project.createdAt,
                            projectUpdatedAt: project.updatedAt
                        }))
                    );
                setBids(allBids);
            }
        } catch {
            // Optionally handle error
        }
    }, [user]);

    useEffect(() => {
        fetchBids();
    }, [fetchBids]);
    const [selectedBid, setSelectedBid] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);

    const filteredBids = useMemo(() => {
        return bids.filter((bid) => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch =
                (bid.projectTitle && bid.projectTitle.toLowerCase().includes(lowerSearch)) ||
                (bid.freelancer_name && bid.freelancer_name.toLowerCase().includes(lowerSearch)) ||
                (typeof bid.price_offer === "number" && bid.price_offer.toString().includes(lowerSearch)) ||
                (bid.bid_status && bid.bid_status.toLowerCase().includes(lowerSearch));
            const matchesStatus = !selectedStatus || bid.bid_status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [bids, searchTerm, selectedStatus]);

    const handleApprove = async (bidId) => {
        if (!selectedBid) return;
        try {
            await fetch(`http://localhost:3000/api/projects/${selectedBid.project_id}/bid/${bidId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'accepted' })
            });
            setSelectedBid(null);
            fetchBids();
        } catch {
            setSelectedBid(null);
        }
    };

    const handleReject = async (bidId) => {
        if (!selectedBid) return;
        try {
            await fetch(`http://localhost:3000/api/projects/${selectedBid.project_id}/bid/${bidId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' })
            });
            setSelectedBid(null);
            fetchBids();
        } catch {
            setSelectedBid(null);
        }
    };

    const FilterCheckbox = ({ name, checked, onChange }) => (
        <label className="flex items-center text-sm text-gray-700 mb-2 hover:bg-gray-200 rounded px-2 py-1 transition-colors duration-150">
            <input type="checkbox" className="mr-2 rounded" checked={checked} onChange={onChange} />
            {name}
        </label>
    );
    if (!user || user.role !== 'moderator') {
        return (
            <div className="font-poppins flex h-screen items-center justify-center">
                <p className="text-xl text-gray-500">Checking authorization</p>
            </div>
        );
    }
    return (
        <div className="font-poppins flex flex-col min-h-screen">
            <div className="flex-grow flex">
                <aside className="w-1/4 p-6 bg-gray-50 border-r border-gray-200">
                    <h2 className="text-lg font-semibold mb-4 font-lora">Search & Filter</h2>
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search bids..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search
                            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                    </div>
                    <nav>
                        <h3 className="text-sm uppercase text-gray-500 font-semibold mb-3">Status</h3>
                        <FilterCheckbox
                            name="All"
                            checked={selectedStatus === null}
                            onChange={() => setSelectedStatus(null)}
                        />
                        {STATUS_OPTIONS.map((status) => (
                            <FilterCheckbox
                                key={status.value}
                                name={status.label}
                                checked={selectedStatus === status.value}
                                onChange={() => setSelectedStatus(status.value)}
                            />
                        ))}
                    </nav>
                </aside>
                <main className="w-3/4 px-2 sm:px-4 md:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold font-lora">Bid Approval</h1>
                        <span className="text-2xl font-bold">{filteredBids.length} bid{filteredBids.length !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-gray-600 mb-4">List of bids awaiting approval.</p>
                    <div className="space-y-3 mt-2">
                        {filteredBids.length > 0 ? (
                            filteredBids.map((bid) => (
                                <BidCard key={bid.bid_ID || bid.id} bid={bid} onClick={() => setSelectedBid(bid)} />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground font-lora">No suitable bids</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {selectedBid && (
                <BidDetailModal
                    bid={selectedBid}
                    onClose={() => setSelectedBid(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
            <Footer />
        </div>
    );
}