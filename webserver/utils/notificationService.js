import { createNotification } from '../routes/api/notification.js';

// Notification templates
const NOTIFICATION_TEMPLATES = {
  // Client notifications
  project_submitted: (data) => ({
    title: 'Dự án đã gửi đi xét duyệt',
    message: `Dự án "${data.projectName}" của bạn đã được gửi đi xét duyệt. Chúng tôi sẽ thông báo kết quả sớm nhất.`,
    icon: 'clock',
    color: 'blue'
  }),
  
  project_approved: (data) => ({
    title: 'Dự án đã được duyệt',
    message: `Chúc mừng! Dự án "${data.projectName}" của bạn đã được phê duyệt. Freelancer có thể bắt đầu đặt giá thầu.`,
    icon: 'check-circle',
    color: 'green'
  }),
  
  project_rejected: (data) => ({
    title: 'Dự án bị từ chối',
    message: `Rất tiếc, dự án "${data.projectName}" không được phê duyệt. Lý do: ${data.reason || 'Không đáp ứng yêu cầu'}`,
    icon: 'x-circle',
    color: 'red'
  }),
  
  // Freelancer notifications
  bid_submitted: (data) => ({
    title: 'Đề xuất đã gửi thành công',
    message: `Đề xuất của bạn cho dự án "${data.projectName}" đã được gửi đi. Client sẽ xem xét và phản hồi sớm.`,
    icon: 'clock',
    color: 'blue'
  }),
  
  bid_approved: (data) => ({
    title: 'Đề xuất được chấp nhận',
    message: `Chúc mừng! Đề xuất của bạn cho dự án "${data.projectName}" đã được chấp nhận. Hãy liên hệ với client để bắt đầu làm việc.`,
    icon: 'check-circle',
    color: 'green'
  }),
  
  bid_rejected: (data) => ({
    title: 'Đề xuất không được chấp nhận',
    message: `Rất tiếc, đề xuất của bạn cho dự án "${data.projectName}" không được chấp nhận. Đừng nản lòng, hãy thử với các dự án khác!`,
    icon: 'x-circle',
    color: 'orange'
  })
};

class NotificationService {
  // Send notification to client when project is submitted
  // userEmail: email của user (dùng làm unique key)
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

  // Send notification to client when project is approved
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

  // Send notification to client when project is rejected
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

  // Send notification to freelancer when bid is submitted
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

  // Send notification to freelancer when bid is approved
  static async notifyBidApproved(userEmail, bidData) {
    try {
      const template = NOTIFICATION_TEMPLATES.bid_approved(bidData);
      await createNotification(userEmail, 'bid_approved', {
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

  // Send notification to freelancer when bid is rejected
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