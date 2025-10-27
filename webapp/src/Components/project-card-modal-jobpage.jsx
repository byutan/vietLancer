import React, { useState } from 'react';
import useAuth from '../ContextAPI/UseAuth';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, DollarSign, Clock, User, Mail, FileText, CheckCircle2, HandCoins } from 'lucide-react';
import { Separator } from './ui/separator';

function ProjectCardModalJobPage({ project, onClose }) {
  // Bid form state
  const [bidDesc, setBidDesc] = useState("");
  const [priceOffer, setPriceOffer] = useState("");
  const [descError, setDescError] = useState("");
  const [priceError, setPriceError] = useState("");

  // Live validation handlers
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
  const [bidStatus, setBidStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  // Get current user
  const { user } = useAuth();
  // Condition to allow bidding
  const canBid = user && (user.role === 'moderator' || (user.role === 'freelance' && user.email_verify === 'verified'));

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

          <div className="space-y-6 py-4">
            {/* 3-column info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
                <span className="text-xs text-muted-foreground">Budget</span>
                <span className="font-semibold text-lg">{typeof project.budget === 'number' ? project.budget.toLocaleString('vi-VN') : project.budget} VND</span>
              </div>
              <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
                <span className="text-xs text-muted-foreground">Created Date</span>
                <span className="font-semibold text-lg">{project.createdAt ? `${new Date(project.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${new Date(project.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : '-'}</span>
              </div>
              <div className="flex flex-col items-start gap-1 p-3 rounded-lg bg-gray-100">
                <span className="text-xs text-muted-foreground">Updated Date</span>
                <span className="font-semibold text-lg">{project.updatedAt ? `${new Date(project.updatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${new Date(project.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : '-'}</span>
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
                    <span className="font-normal">{project.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-semibold">Email:</span>
                    <span className="font-normal">{project.clientEmail}</span>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            {/* Required Skills */}
            <div>
              <h3 className="font-semibold mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(project.skills) && project.skills.length > 0 ? project.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-100 font-semibold border border-gray-200">
                    {skill}
                  </Badge>
                )) : <span className="text-muted-foreground text-sm">None</span>}
              </div>
            </div>
            <Separator className="bg-gray-200" />
            {/* Payment Method & Work Form */}
            <div className="space-y-2">
              {project.paymentMethod && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-semibold">Payment Method:</span>
                  <span className="font-medium">
                    {project.paymentMethod === 'per_project' ? 'Per Project'
                      : project.paymentMethod === 'per_hour' ? 'Per Hour'
                      : project.paymentMethod === 'per_month' ? 'Per Month'
                      : project.paymentMethod === 'other' ? 'Other'
                      : project.paymentMethod}
                  </span>
                </div>
              )}
              {project.workForm && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-semibold">Work Form:</span>
                  <span className="font-medium">{project.workForm}</span>
                </div>
              )}
            </div>
            <Separator className="bg-gray-200" />
            {/* Bidding Information */}
            <div className="mt-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                Bidding Information
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 font-semibold">
                <HandCoins className="w-4 h-4 text-yellow-600" />
                <span>Bidding:</span>
                <span className="text-base font-bold text-gray-900 ml-1">
                  {Array.isArray(project.list_of_bid)
                    ? project.list_of_bid.filter(bid => bid.bid_status === 'accepted' || bid.bid_status === 'approved').length
                    : 0}
                </span>
              </div>
            </div>
          </div>

        <Separator className="bg-gray-200" />
        {/* Bid Form always visible */}
        <div className={`mt-8 p-4 border rounded-lg ${canBid ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-100'}`}>
          <h3 className={`font-bold text-lg mb-4 ${canBid ? 'text-green-700' : 'text-gray-500'}`}>Bid for this project</h3>
          <form className="space-y-4" onSubmit={async e => {
            e.preventDefault();
            setSuccessMsg("");
            setErrorMsg("");
            let valid = true;
            if (bidDesc.length < 20 || bidDesc.length > 2500) {
              setDescError('Description must be between 20 and 2500 characters.');
              valid = false;
            } else {
              setDescError("");
            }
            const price = Number(priceOffer);
            if (isNaN(price) || price < 1000000 || price > 1000000000) {
              setPriceError('Offer price must be between 1 million and 1 billion VND.');
              valid = false;
            } else {
              setPriceError("");
            }
            if (!valid) return;
            setLoading(true);
            try {
              const res = await fetch(`http://localhost:3000/api/projects/${project.id}/bid`, {
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
                setBidDesc("");
                setPriceOffer("");
                setBidStatus("pending");
                // Reload project info nếu cần (gọi lại onClose để reload ngoài JobPage)
                if (typeof onClose === 'function') onClose();
              } else {
                setErrorMsg(data.message || 'Failed to submit bid.');
              }
            } catch (err) {
              setErrorMsg('Network error.');
            } finally {
              setLoading(false);
            }
          }}>
            <div>
              <label className={`block font-semibold mb-1 ${canBid ? '' : 'text-gray-400'}`} htmlFor="bid_desc">Bid Description</label>
              <textarea
                id="bid_desc"
                className={`w-full border rounded-md px-3 py-2 placeholder-gray-500 ${canBid ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-200 text-gray-400'}`}
                rows={3}
                value={bidDesc}
                onChange={handleBidDescChange}
                placeholder="Enter your bid description..."
                disabled={!canBid}
                maxLength={2500}
              />
              {/* <div className="text-xs mt-1 text-gray-500">At least 20 characters. Max 2500 characters</div> */}
              {descError && <div className="text-xs text-red-500 mt-1">{descError}</div>}
            </div>
            <div>
              <label className={`block font-semibold mb-1 ${canBid ? '' : 'text-gray-400'}`} htmlFor="price_offer">Offer Price (VND)</label>
              <input
                id="price_offer"
                type="number"
                className={`w-full border rounded-md px-3 py-2 placeholder-gray-500 ${canBid ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-200 text-gray-400'}`}
                value={priceOffer}
                onChange={handlePriceOfferChange}
                placeholder="Enter your offer price"
                min={1000000}
                max={1000000000}
                disabled={!canBid}
              />
              {/* <div className="text-xs mt-1 text-gray-500">Minimum 1 million VND</div> */}
              {priceError && <div className="text-xs text-red-500 mt-1">{priceError}</div>}
            </div>
            {/* bid_ID and bid_date will be generated by backend on submit */}
            {canBid && (
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="submit"
                  className="gap-2 bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-md font-medium transition-colors flex items-center"
                  disabled={loading}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {loading ? 'Submitting...' : 'Submit Bid'}
                </Button>
              </div>
            )}
            {successMsg && <div className="text-green-600 text-sm mt-2 text-center">{successMsg}</div>}
            {errorMsg && <div className="text-red-600 text-sm mt-2 text-center">{errorMsg}</div>}
          </form>
          {!canBid && (
            <div className="text-center text-gray-500 mt-4 text-sm">Only moderators or freelancers with verified email can bid for this project.</div>
          )}
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
        </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
export default ProjectCardModalJobPage;
