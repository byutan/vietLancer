import React, { useState } from 'react';
import useAuth from '../ContextAPI/UseAuth';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, HandCoins, CheckCircle2 } from 'lucide-react';
import { Separator } from './ui/separator';
import { API_URL } from '../utils/apiConfig'; 
function ProjectCardModalJobPage({ project, onClose }) {
  const [bidDesc, setBidDesc] = useState("");
  const [priceOffer, setPriceOffer] = useState("");
  const [descError, setDescError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const { user } = useAuth();

  // State để cập nhật giao diện ngay lập tức sau khi bid thành công
  const [localUserBid, setLocalUserBid] = useState(null);

  // 1. Tìm Bid của User hiện tại (nếu có)
  let userBid = localUserBid;
  const formatCurrency = (amount) => {

    const num = Number(amount);

    if (isNaN(num)) return amount;

    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  };

  // Kiểm tra kỹ list_of_bid trước khi find để tránh lỗi crash
  if (!userBid && user && Array.isArray(project.list_of_bid)) {
    userBid = project.list_of_bid.find(
      (bid) => bid.freelancer_email === user.email
    );
  }

  // 2. Check quyền Bid
  let canBid = false;
  if (user) {
    if (user.role === 'moderator') {
      canBid = true;
    } else if (user.role === 'freelancer') {
        // Check verify (hỗ trợ cả DB mới và cũ)
        const isVerified = user.email_verify === 'verified' || user.verify_status === 1;
        
        if (isVerified) {
            // Cho phép bid nếu chưa bid HOẶC bid cũ đã bị từ chối
            // ✅ FIX: So sánh status không phân biệt hoa thường
            if (!userBid || (userBid && userBid.bid_status && userBid.bid_status.toLowerCase() === 'rejected')) {
                canBid = true;
            }
        }
    }
  }

  // 3. Check Hết hạn (Expired)
  let isExpired = false;
  // Ưu tiên dùng deadline từ DB, nếu không có thì tính 7 ngày từ lúc duyệt
  const deadline = project.deadline ? new Date(project.deadline) : (project.updatedAt ? new Date(new Date(project.updatedAt).setDate(new Date(project.updatedAt).getDate() + 7)) : null);
  
  if (deadline) {
    const now = new Date();
    if (deadline.getTime() <= now.getTime()) {
      isExpired = true;
    }
  }

  // Khóa form nếu đã bid (và đang chờ/được nhận) hoặc hết hạn
  // ✅ FIX: So sánh status an toàn
  const hasActiveBid = userBid && userBid.bid_status && userBid.bid_status.toLowerCase() !== 'rejected';
  const formLocked = isExpired || !!hasActiveBid;

  const handleBidDescChange = (e) => {
    const value = e.target.value;
    setBidDesc(value);
    if (value.length < 20 || value.length > 2500) {
      setDescError('Description must be between 20 and 2500 characters.');
    } else {
      setDescError("");
    }
  };

  const handlePriceOfferChange = (e) => {
    const value = e.target.value;
    setPriceOffer(value);
    const price = Number(value);
    if (isNaN(price) || price < 1000000 || price > 1000000000) {
      setPriceError('Offer price must be between 1 million and 1 billion VND.');
    } else {
      setPriceError("");
    }
  };

  // Tính số lượng người đã bid (Đếm số bid hợp lệ)
  // ✅ FIX: Đếm tất cả các bid pending/accepted/rejected để hiển thị độ hot
  const bidCount = Array.isArray(project.list_of_bid) ? project.list_of_bid.length : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl min-w-[800px] max-h-[90vh] overflow-y-auto bg-white font-poppins" showCloseButton={false}>
        <DialogHeader>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <DialogTitle className="text-xl font-bold mb-1 break-words leading-snug">{project.title}</DialogTitle>
                {project.id && (
                  <div className="text-xs text-gray-500 font-semibold mb-2">Project ID: <span className="font-bold">{project.id}</span></div>
                )}
              </div>
              <Badge variant="outline" className="text-base font-semibold px-3 py-1">{project.category}</Badge>
            </div>
            <DialogDescription className="text-lg text-gray-700 font-semibold mb-2">{project.description}</DialogDescription>
          </DialogHeader>

          {/* Info section */}
          <div className="space-y-6 py-4">
            {/* 3 cột: Budget, Created Date, Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
                <span className="text-xs text-muted-foreground">Budget</span>
                <span className="font-semibold text-lg">{formatCurrency(project.budget)}</span>
              </div>
              <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
                <span className="text-xs text-muted-foreground">Posted Date</span>
                <span className="font-semibold text-lg">{project.createdAt ? new Date(project.createdAt).toLocaleDateString('vi-VN') : '-'}</span>
              </div>
              <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
                <span className="text-xs text-muted-foreground">Bid Deadline</span>
                <span className={`font-semibold text-lg ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                    {deadline ? deadline.toLocaleDateString('vi-VN') : 'Open'}
                </span>
              </div>
            </div>
            
            {/* ... Các phần Separator và Client Info giữ nguyên như cũ ... */}
            <Separator className="bg-gray-200" />
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Client Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="text-muted-foreground font-semibold">Name:</span><span className="font-normal">{project.clientName}</span></div>
                <div className="flex items-center gap-2"><span className="text-muted-foreground font-semibold">Email:</span><span className="font-normal">{project.clientEmail}</span></div>
              </div>
            </div>

            <Separator className="bg-gray-200" />
            
            
          </div>

        <Separator className="bg-gray-200" />
        
        {/* Form Bid */}
        <div className={`mt-8 p-4 border rounded-lg ${(canBid && !formLocked) ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-100'}`}>
          <h3 className={`font-bold text-lg mb-4 ${(canBid && !formLocked) ? 'text-green-700' : 'text-gray-500'}`}>Bid for this project</h3>
          <form className="space-y-4" onSubmit={async e => {
            e.preventDefault();
            setSuccessMsg(""); setErrorMsg("");
            let valid = true;
            if (bidDesc.length < 20 || bidDesc.length > 2500) { setDescError('Description must be between 20 and 2500 characters.'); valid = false; } else { setDescError(""); }
            const price = Number(priceOffer);
            if (isNaN(price) || price < 1000000 || price > 1000000000) { setPriceError('Offer price must be between 1 million and 1 billion VND.'); valid = false; } else { setPriceError(""); }
            
            if (!valid) return;
            setLoading(true);
            try {
              const res = await fetch(`${API_URL}/api/projects/${project.id}/bid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  freelancer_name: user?.name,
                  freelancer_email: user?.email,
                  bid_desc: bidDesc,
                  price_offer: price
                })
              });
              const data = await res.json();
              if (data.success) {
                setSuccessMsg('Bid submitted successfully!');
                setBidDesc(""); setPriceOffer("");
                // Cập nhật state local để khóa form ngay
                setLocalUserBid({
                  freelancer_name: user?.name,
                  freelancer_email: user?.email,
                  bid_desc: bidDesc,
                  price_offer: price,
                  bid_status: 'Pending', // Giả lập status
                  bid_date: new Date().toISOString(),
                });
              } else {
                setErrorMsg(data.message || 'Failed to submit bid.');
              }
            } catch {
              setErrorMsg('Network error.');
            } finally {
              setLoading(false);
            }
          }}>
            {/* ... Input fields (Giữ nguyên như cũ) ... */}
            <div>
              <label className={`block font-semibold mb-1 ${(canBid && !formLocked) ? '' : 'text-gray-400'}`} htmlFor="bid_desc">Bid Description</label>
              <textarea id="bid_desc" className={`w-full border rounded-md px-3 py-2 ${(canBid && !formLocked) ? 'border-green-300 bg-white text-black' : 'border-gray-300 bg-gray-100 text-gray-500'}`} rows={3} value={bidDesc} onChange={handleBidDescChange} placeholder="Enter your bid description..." disabled={!canBid || formLocked} maxLength={2500} />
              {descError && <div className="text-xs text-red-500 mt-1">{descError}</div>}
            </div>
            <div>
              <label className={`block font-semibold mb-1 ${(canBid && !formLocked) ? '' : 'text-gray-400'}`} htmlFor="price_offer">Offer Price (VND)</label>
              <input id="price_offer" type="number" className={`w-full border rounded-md px-3 py-2 ${(canBid && !formLocked) ? 'border-green-300 bg-white text-black' : 'border-gray-300 bg-gray-100 text-gray-500'}`} value={priceOffer} onChange={handlePriceOfferChange} placeholder="Enter your offer price" min={1000000} max={1000000000} disabled={!canBid || formLocked} />
              {priceError && <div className="text-xs text-red-500 mt-1">{priceError}</div>}
            </div>
            {canBid && !formLocked && (
              <div className="flex justify-end gap-2 mt-4">
                <Button type="submit" className="gap-2 bg-green-500 text-white hover:bg-green-600" disabled={loading}>
                  <CheckCircle2 className="w-4 h-4" /> {loading ? 'Submitting...' : 'Submit Bid'}
                </Button>
              </div>
            )}
            {formLocked && <div className="text-center text-gray-500 mt-4 text-sm">{isExpired ? 'The project has expired.' : 'You have already submitted a bid.'}</div>}
            {!canBid && !formLocked && <div className="text-center text-gray-500 mt-4 text-sm">Only verified freelancers can bid.</div>}
            {successMsg && <div className="text-green-600 text-sm mt-2 text-center">{successMsg}</div>}
            {errorMsg && <div className="text-red-600 text-sm mt-2 text-center">{errorMsg}</div>}
          </form>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border border-gray-300">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default ProjectCardModalJobPage;