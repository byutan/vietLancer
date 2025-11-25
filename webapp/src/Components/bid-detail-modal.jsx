import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Separator } from './ui/separator';

function BidDetailModal({ bid, onClose, onApprove, onReject }) {
  if (!bid) return null;

  // ✅ FIX: So sánh status không phân biệt hoa thường
  const isPending = bid.bid_status && bid.bid_status.toLowerCase() === "pending";

  // ✅ FIX: Lấy ID chính xác (tùy backend trả về bid_id hay id)
  const bidId = bid.bid_id || bid.bid_ID || bid.id;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl min-w-[800px] max-h-[90vh] overflow-y-auto bg-white font-poppins" showCloseButton={false}>

        <DialogHeader>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <DialogTitle className="text-xl font-bold mb-1 break-words leading-snug">
                {bid.projectTitle || bid.project_name || "Unknown Project"}
              </DialogTitle>
              {bid.project_ID && (
                <div className="text-xs text-gray-500 font-semibold mb-2">Project ID: <span className="font-bold">{bid.project_ID}</span></div>
              )}
            </div>
            <Badge variant="outline" className="text-base font-semibold px-3 py-1">
                {/* Hiển thị status của Bid */}
                {bid.bid_status}
            </Badge>
          </div>
          {/* Project Description (Optional) */}
          {/* <DialogDescription className="text-lg text-gray-700 font-semibold mb-2">{bid.projectDescription}</DialogDescription> */}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Bid Details Section */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Bid Information
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-semibold">Freelancer:</span>
                        <span className="font-bold text-blue-600">{bid.freelancer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-semibold">Email:</span>
                        <span className="font-normal">{bid.freelancer_email}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <span className="text-muted-foreground font-semibold block mb-1">Proposal:</span>
                        <p className="font-normal text-gray-700 italic">"{bid.bid_desc}"</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-green-50 border border-green-100">
                <span className="text-xs text-muted-foreground">Price Offer</span>
                <span className="font-bold text-lg text-green-700">
                    {Number(bid.price_offer).toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
                <span className="text-xs text-muted-foreground">Bid Date</span>
                <span className="font-semibold text-lg">
                    {bid.bid_date ? new Date(bid.bid_date).toLocaleDateString('vi-VN') : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="border border-gray-300 hover:border-black px-4 py-2 rounded-md text-base font-medium transition-colors"
          >
            Close
          </Button>
          
          {/* ✅ Nút Approve/Reject sẽ hiện ra vì logic isPending đã sửa */}
          {isPending && (
            <>
              <Button
                onClick={() => onReject(bidId)}
                className="gap-2 bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md font-medium transition-colors flex items-center"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                onClick={() => onApprove(bidId)}
                className="gap-2 bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-md font-medium transition-colors flex items-center"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Bid
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default BidDetailModal;