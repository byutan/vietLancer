import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Calendar, DollarSign, Clock, User, Mail, CheckCircle2, XCircle, FileText } from 'lucide-react'
import { Separator } from './ui/separator'

function BidDetailModal({ bid, onClose, onApprove, onReject }) {
  if (!bid) return null;
  const isPending = bid.bid_status === "pending";
  return (
    <Dialog open={true} onOpenChange={onClose}>
  <DialogContent className="max-w-6xl min-w-[800px] max-h-[90vh] overflow-y-auto bg-white font-poppins" showCloseButton={false}>

        <DialogHeader>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <DialogTitle className="text-xl font-bold mb-1 break-words leading-snug">{bid.projectTitle || bid.title}</DialogTitle>
              {bid.project_id && (
                <div className="text-xs text-gray-500 font-semibold mb-2">Project ID: <span className="font-bold">{bid.project_id}</span></div>
              )}
            </div>
            <Badge variant="outline" className="text-base font-semibold px-3 py-1">{bid.projectCategory || bid.category}</Badge>
          </div>
          <DialogDescription className="text-lg text-gray-700 font-semibold mb-2">{bid.projectDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 3-column info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
              <span className="text-xs text-muted-foreground">Budget</span>
              <span className="font-semibold text-lg">{typeof bid.projectBudget === 'number' ? bid.projectBudget.toLocaleString('vi-VN') : bid.projectBudget} VND</span>
            </div>
            <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
              <span className="text-xs text-muted-foreground">Created Date</span>
              <span className="font-semibold text-lg">{bid.projectCreatedAt ? `${new Date(bid.projectCreatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${new Date(bid.projectCreatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : '-'}</span>
            </div>
            <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
              <span className="text-xs text-muted-foreground">Updated Date</span>
              <span className="font-semibold text-lg">{bid.projectUpdatedAt ? `${new Date(bid.projectUpdatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${new Date(bid.projectUpdatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : '-'}</span>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Client Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Client Information
            </h3>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-semibold">Name:</span>
                  <span className="font-normal">{bid.projectClient}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-semibold">Email:</span>
                  <span className="font-normal">{bid.projectClientEmail}</span>
                </div>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          {/* Required Skills */}
          <div>
            <h3 className="font-semibold mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(bid.projectSkills) && bid.projectSkills.length > 0 ? bid.projectSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-100 font-semibold border border-gray-200">
                  {skill}
                </Badge>
              )) : <span className="text-muted-foreground text-sm">None</span>}
            </div>
          </div>
          <Separator className="bg-gray-200" />
          {/* Payment Method & Work Form */}
          <div className="space-y-2">
            {bid.projectPaymentMethod && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">Payment Method:</span>
                <span className="font-medium">
                  {bid.projectPaymentMethod === 'per_project' ? 'Per Project'
                    : bid.projectPaymentMethod === 'per_hour' ? 'Per Hour'
                    : bid.projectPaymentMethod === 'per_month' ? 'Per Month'
                    : bid.projectPaymentMethod === 'other' ? 'Other'
                    : bid.projectPaymentMethod}
                </span>
              </div>
            )}
            {bid.projectWorkForm && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">Work Form:</span>
                <span className="font-medium">{bid.projectWorkForm}</span>
              </div>
            )}
          </div>

          <Separator className="bg-gray-200" />

          {/* Bid Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Bid Information
            </h3>
            <div className="space-y-2 text-sm mb-4">
              {bid.bid_ID && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-semibold">Bid ID:</span>
                  <span className="font-normal">{bid.bid_ID}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">Freelancer Name:</span>
                <span className="font-normal">{bid.freelancer_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">Freelancer Email:</span>
                <span className="font-normal">{bid.freelancer_email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">Description:</span>
                <span className="font-normal">{bid.bid_desc}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
                <span className="text-xs text-muted-foreground">Offer</span>
                <span className="font-semibold text-lg">{typeof bid.price_offer === 'number' ? bid.price_offer.toLocaleString('vi-VN') : bid.price_offer} VND</span>
              </div>
              <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
                <span className="text-xs text-muted-foreground">Bid Date</span>
                <span className="font-semibold text-lg">{bid.bid_date ? `${new Date(bid.bid_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${new Date(bid.bid_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border border-gray-300 hover:border-black px-4 py-2 rounded-md text-base font-medium transition-colors"
            style={{ borderWidth: 1 }}
          >
            Close
          </Button>
          {isPending && (
            <>
              <Button
                onClick={() => onReject(bid.bid_ID || bid.id)}
                className="gap-2 bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md font-medium transition-colors flex items-center"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                onClick={() => onApprove(bid.bid_ID || bid.id)}
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
