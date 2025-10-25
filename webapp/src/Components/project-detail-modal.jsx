import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Calendar, DollarSign, Clock, User, Mail, CheckCircle2, XCircle, FileText } from 'lucide-react'
import { Separator } from './ui/separator'

function ProjectDetailModal({ project, onClose, onApprove, onReject }) {
  const isPending = project.status === "pending";
  return (
    <Dialog open={true} onOpenChange={onClose}>
  <DialogContent className="max-w-6xl min-w-[700px] max-h-[90vh] overflow-y-auto bg-white font-poppins" showCloseButton={false}>
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
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{project.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{project.clientEmail}</span>
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

          {/* <Separator className="bg-gray-200" /> */}

          {/* Detailed Requirements (hide if '-') */}
          {/* {project.requirements && project.requirements !== '-' && (
            <>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Detailed Requirements
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed text-pretty">{project.requirements}</p>
              </div>
              <Separator className="bg-gray-200" />
            </>
          )} */}

          {/* Deliverables (hide if '-') */}
          {/* {project.deliverables && project.deliverables !== '-' && (
            <div>
              <h3 className="font-semibold mb-3">Deliverables</h3>
              <p className="text-base text-muted-foreground leading-relaxed text-pretty">{project.deliverables}</p>
            </div>
          )} */}
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
                onClick={() => onReject(project.id)}
                className="gap-2 bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md font-medium transition-colors flex items-center"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                onClick={() => onApprove(project.id)}
                className="gap-2 bg-green-500 text-white hover:bg-green-600 px-4 py-2 rounded-md font-medium transition-colors flex items-center"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve Project
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default ProjectDetailModal;
