// src/controllers/messageController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendQuoteNotification } = require("../config/mailer");

// Public: Create a new message from the contact form
const createMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message, type, fullName, company, projectType, budgetRange, timeline, description } = req.body;

    // Handle Quote Request
    if (type === "quote") {
      if (!fullName || !email || !projectType || !description) {
        return res.status(400).json({
          success: false,
          message: "Full name, email, project type, and description are required for quotes.",
        });
      }

      const formattedMessage = `
--- QUOTE REQUEST DETAILS ---
Company: ${company || "N/A"}
Project Type: ${projectType}
Budget Range: ${budgetRange}
Timeline: ${timeline}

Description:
${description}
      `.trim();

      const newQuote = await prisma.message.create({
        data: {
          name: fullName,
          email,
          phone: phone || "",
          subject: `Quote Request: ${projectType}`,
          message: formattedMessage,
          status: "unread",
        },
      });

      // Send Email Notification to Admin
      try {
        await sendQuoteNotification({
          name: fullName,
          email,
          phone,
          company,
          projectType,
          budgetRange,
          timeline,
          description,
        });
      } catch (mailErr) {
        console.error("Failed to send quote email notification:", mailErr);
        // We don't return error to user because the DB record was already created successfully
      }

      return res.status(201).json({
        success: true,
        message: "Quote request sent successfully",
        data: newQuote,
      });
    }

    // Handle Regular Message
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        phone: phone || "",
        subject: subject || "No Subject",
        message,
        status: "unread",
      },
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Create Message Error", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// Admin: Get all messages
const getMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: {
        receivedAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get Messages Error", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// Admin: Update status (read/unread)
const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["read", "unread"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'read' or 'unread'.",
      });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({
      success: true,
      message: `Message marked as ${status}`,
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Update Message Status Error", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message status",
      error: error.message,
    });
  }
};

// Admin: Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.message.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete Message Error", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

// Admin: Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.message.count({
      where: {
        status: "unread"
      }
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error("Get Unread Count Error", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread message count",
      error: error.message
    });
  }
};

module.exports = {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage,
  getUnreadCount,
};
