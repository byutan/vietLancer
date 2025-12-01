import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, FileText, CheckCircle2, XCircle, DollarSign, Briefcase } from 'lucide-react';
import { Separator } from './ui/separator';
const formatCurrency = (amount) => {

    const num = Number(amount);

    if (isNaN(num)) return amount;

    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  };
function BidDetailModal({ bid, onClose, onApprove, onReject }) {
  if (!bid) return null;

  const isPending = bid.bidStatus && bid.bidStatus.toLowerCase() === "pending";
  const bidId = bid.bid_id || bid.bid_ID || bid.id;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl min-w-[800px] max-h-[90vh] overflow-y-auto bg-white font-poppins" showCloseButton={false}>

        <DialogHeader>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <DialogTitle className="text-xl font-bold mb-1 break-words leading-snug">
                {bid.projectTitle || "Unknown Project"}
              </DialogTitle>
              {bid.project_ID && (
                <div className="text-xs text-gray-500 font-semibold mb-2">Project ID: <span className="font-bold">{bid.project_ID}</span></div>
              )}
            </div>
            <Badge variant="outline" className="text-base font-semibold px-3 py-1">
                {bid.bidStatus}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            {/* Cột Trái: Thông tin người tham gia */}
            <div className="space-y-4">
                {/* Client Info */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-blue-800">
                        <Briefcase className="w-4 h-4" /> Client (Employer)
                    </h3>
                    <div className="text-sm space-y-1">
                        <div className="flex gap-2"><span className="font-semibold w-16">Name:</span> <span>{bid.clientName}</span></div>
                        <div className="flex gap-2"><span className="font-semibold w-16">Email:</span> <span>{bid.clientEmail}</span></div>
                        <div className="flex gap-2"><span className="font-semibold w-16">Budget:</span> <span>{formatCurrency(bid.projectBudget)}</span></div>
                    </div>
                </div>

                {/* Freelancer Info */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-800">
                        <User className="w-4 h-4" /> Freelancer (Applicant)
                    </h3>
                    <div className="text-sm space-y-1">
                        <div className="flex gap-2"><span className="font-semibold w-16">Name:</span> <span>{bid.freelancerName || bid.freelancer_name}</span></div>
                        <div className="flex gap-2"><span className="font-semibold w-16">Email:</span> <span>{bid.freelancerEmail || bid.freelancer_email}</span></div>
                    </div>
                </div>
            </div>

            {/* Cột Phải: Chi tiết Bid */}
            <div className="space-y-4">
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 border-b pb-2">
                        <FileText className="w-4 h-4" /> Proposal Details
                    </h3>
                    
                    <div className="mb-4">
                        <span className="text-xs text-gray-500 uppercase font-bold">Description</span>
                        <p className="text-sm text-gray-700 mt-1 italic bg-gray-50 p-2 rounded">
                            "{bid.bid_desc}"
                        </p>
                    </div>

                    <div className="flex justify-between items-center bg-green-50 p-3 rounded border border-green-100">
                        <span className="text-sm font-semibold text-green-800">Bid Amount</span>
                        <span className="text-lg font-bold text-green-700 flex items-center gap-1">
                            
                            {formatCurrency(bid.priceOffer)}
                        </span>
                    </div>
                    
                    <div className="mt-2 text-right text-xs text-gray-400">
                        Submitted: {bid.bid_date ? new Date(bid.bid_date).toLocaleString('vi-VN') : 'N/A'}
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="border border-gray-300">Close</Button>
          {isPending && (
            <>
              <Button onClick={() => onReject(bidId)} className="gap-2 bg-red-500 text-white hover:bg-red-600">
                <XCircle className="w-4 h-4" /> Reject
              </Button>
              <Button onClick={() => onApprove(bidId)} className="gap-2 bg-green-500 text-white hover:bg-green-600">
                <CheckCircle2 className="w-4 h-4" /> Approve Bid
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default BidDetailModal;