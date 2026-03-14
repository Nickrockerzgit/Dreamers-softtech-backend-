// src/controllers/proposalController.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ── CREATE PROPOSAL (Public or Admin) ───────────────────────────
const createProposal = async (req, res) => {
  try {
    const { 
      fullName, email, phone, company, projectType, 
      budgetRange, timeline, description, source 
    } = req.body;

    // Validation
    if (!fullName || !email || !projectType || !description) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    const proposal = await prisma.proposal.create({
      data: {
        fullName,
        email,
        phone,
        company,
        projectType,
        budgetRange,
        timeline,
        description,
        source: source || "client", // default to client if not provided
        status: source === "admin" ? "pending" : "pending",
      },
    });

    res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating proposal", error: error.message });
  }
};

// ── GET ALL PROPOSALS (Admin Only) ──────────────────────────────
const getAllProposals = async (req, res) => {
  try {
    const proposals = await prisma.proposal.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, count: proposals.length, data: proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching proposals" });
  }
};

// ── UPDATE STATUS (Admin Only) ──────────────────────────────────
const updateProposalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const data = { status };
    if (status === "sent") data.sentAt = new Date();
    if (status === "confirmed") data.confirmedAt = new Date();

    const updated = await prisma.proposal.update({
      where: { id },
      data,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

// ── VERIFY MAGIC TOKEN (Public - for Client) ────────────────────
const verifyProposalToken = async (req, res) => {
  try {
    const { token } = req.params;
    const proposal = await prisma.proposal.findUnique({
      where: { magicToken: token },
    });

    if (!proposal) {
      return res.status(404).json({ success: false, message: "Invalid or expired link" });
    }

    res.status(200).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification error" });
  }
};

// ── CONFIRM PROPOSAL (Public - for Client) ──────────────────────
const confirmProposal = async (req, res) => {
  try {
    const { token } = req.params;
    
    const proposal = await prisma.proposal.update({
      where: { magicToken: token },
      data: {
        status: "confirmed",
        confirmedAt: new Date(),
      },
    });

    // Send Notification to Admin
    const { sendQuoteNotification } = require("../config/mailer");
    try {
        await sendQuoteNotification({
            name: proposal.fullName,
            email: proposal.email,
            phone: proposal.phone,
            company: proposal.company,
            projectType: proposal.projectType,
            budgetRange: proposal.budgetRange,
            timeline: proposal.timeline,
            description: `CLIENT HAS OFFICIALLY CONFIRMED THIS PROPOSAL!\n\nOriginal Description:\n${proposal.description}`
        });
    } catch (mailErr) {
        console.error("Confirmation mail failed:", mailErr);
    }

    res.status(200).json({ success: true, message: "Proposal confirmed!", data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Confirmation failed" });
  }
};

// ── DELETE PROPOSAL (Admin Only) ────────────────────────────────
const deleteProposal = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.proposal.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Proposal deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting proposal" });
  }
};

// ── REJECT PROPOSAL (Public - for Client) ───────────────────────
const rejectProposal = async (req, res) => {
  try {
    const { token } = req.params;
    
    const proposal = await prisma.proposal.update({
      where: { magicToken: token },
      data: {
        status: "rejected",
      },
    });

    // Send Notification to Admin
    const { sendQuoteNotification } = require("../config/mailer");
    try {
        await sendQuoteNotification({
            name: proposal.fullName,
            email: proposal.email,
            projectType: proposal.projectType,
            budgetRange: proposal.budgetRange,
            timeline: proposal.timeline,
            description: `CLIENT HAS DECLINED/DISMISSED THIS PROPOSAL.`
        });
    } catch (mailErr) {
        console.error("Rejection mail failed:", mailErr);
    }

    res.status(200).json({ success: true, message: "Proposal dismissed", data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: "Rejection failed" });
  }
};

module.exports = {
  createProposal,
  getAllProposals,
  updateProposalStatus,
  verifyProposalToken,
  confirmProposal,
  rejectProposal,
  deleteProposal,
};
