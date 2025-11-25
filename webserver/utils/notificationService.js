import { createNotification } from '../routes/api/notification.js';

// Notification templates
const NOTIFICATION_TEMPLATES = {
  // Client notifications
  project_submitted: (data) => ({
    title: 'Project Submitted for Review',
    message: `Your project "${data.projectName}" has been successfully submitted and is now under review. We'll notify you once a decision has been made.`,
    icon: 'clock',
    color: 'blue'
  }),
  
  project_approved: (data) => ({
    title: 'Project Approved',
    message: `Congratulations! Your project "${data.projectName}" has been approved and is now live. Freelancers can start submitting proposals.`,
    icon: 'check-circle',
    color: 'green'
  }),
  
  project_rejected: (data) => ({
    title: 'Project Not Approved',
    message: `Unfortunately, your project "${data.projectName}" was not approved. Reason: ${data.reason || 'Does not meet platform requirements'}. Please review our guidelines and resubmit.`,
    icon: 'x-circle',
    color: 'red'
  }),

  // 🔥 MỚI: Thông báo cho Client khi có Bid mới được Admin duyệt
  new_bid_received: (data) => ({
    title: 'New Proposal Received',
    message: `A new proposal from "${data.freelancerName}" has been approved for your project "${data.projectName}". Check it out now!`,
    icon: 'file-text',
    color: 'blue'
  }),
  
  // Freelancer notifications
  bid_submitted: (data) => ({
    title: 'Proposal Submitted Successfully',
    message: `Your proposal for "${data.projectName}" has been submitted. The client will review it and respond shortly.`,
    icon: 'clock',
    color: 'blue'
  }),
  
  bid_accepted: (data) => ({
    title: 'Proposal Accepted',
    message: `Great news! Your proposal for "${data.projectName}" has been accepted. Please contact the client to begin work.`,
    icon: 'check-circle',
    color: 'green'
  }),
  
  bid_rejected: (data) => ({
    title: 'Proposal Not Selected',
    message: `Your proposal for "${data.projectName}" was not selected this time. Keep refining your approach and explore other opportunities.`,
    icon: 'x-circle',
    color: 'orange'
  })
};

class NotificationService {
  // ... (Các hàm cũ giữ nguyên) ...

  static async notifyProjectSubmitted(userEmail, projectData) {
    try {
      const template = NOTIFICATION_TEMPLATES.project_submitted(projectData);
      await createNotification(userEmail, 'project_submitted', {
        ...template,
        projectId: projectData.projectId,
        projectName: projectData.projectName,
        submittedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending project submitted notification:', error);
    }
  }

  static async notifyProjectApproved(userEmail, projectData) {
    try {
      const template = NOTIFICATION_TEMPLATES.project_approved(projectData);
      await createNotification(userEmail, 'project_approved', {
        ...template,
        projectId: projectData.projectId,
        projectName: projectData.projectName,
        approvedAt: new Date().toISOString(),
        approvedBy: projectData.approvedBy
      });
    } catch (error) {
      console.error('Error sending project approved notification:', error);
    }
  }

  static async notifyProjectRejected(userEmail, projectData) {
    try {
      const template = NOTIFICATION_TEMPLATES.project_rejected(projectData);
      await createNotification(userEmail, 'project_rejected', {
        ...template,
        projectId: projectData.projectId,
        projectName: projectData.projectName,
        reason: projectData.reason,
        rejectedAt: new Date().toISOString(),
        rejectedBy: projectData.rejectedBy
      });
    } catch (error) {
      console.error('Error sending project rejected notification:', error);
    }
  }

  // 🔥 MỚI: Hàm gửi thông báo cho Client khi có Bid mới
  static async notifyNewBidReceived(userEmail, bidData) {
    try {
      const template = NOTIFICATION_TEMPLATES.new_bid_received(bidData);
      await createNotification(userEmail, 'new_bid_received', {
        ...template,
        bidId: bidData.bidId,
        projectId: bidData.projectId,
        projectName: bidData.projectName,
        freelancerName: bidData.freelancerName,
        bidAmount: bidData.bidAmount,
        receivedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending new bid received notification:', error);
    }
  }

  static async notifyBidSubmitted(userEmail, bidData) {
    try {
      const template = NOTIFICATION_TEMPLATES.bid_submitted(bidData);
      await createNotification(userEmail, 'bid_submitted', {
        ...template,
        bidId: bidData.bidId,
        projectId: bidData.projectId,
        projectName: bidData.projectName,
        bidAmount: bidData.bidAmount,
        submittedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending bid submitted notification:', error);
    }
  }

  static async notifyBidApproved(userEmail, bidData) {
    try {
      const template = NOTIFICATION_TEMPLATES.bid_accepted(bidData);
      await createNotification(userEmail, 'bid_accepted', {
        ...template,
        bidId: bidData.bidId,
        projectId: bidData.projectId,
        projectName: bidData.projectName,
        bidAmount: bidData.bidAmount,
        approvedAt: new Date().toISOString(),
        clientEmail: bidData.clientEmail
      });
    } catch (error) {
      console.error('Error sending bid approved notification:', error);
    }
  }

  static async notifyBidRejected(userEmail, bidData) {
    try {
      const template = NOTIFICATION_TEMPLATES.bid_rejected(bidData);
      await createNotification(userEmail, 'bid_rejected', {
        ...template,
        bidId: bidData.bidId,
        projectId: bidData.projectId,
        projectName: bidData.projectName,
        rejectedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending bid rejected notification:', error);
    }
  }
}

export default NotificationService;