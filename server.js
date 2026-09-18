import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow your frontend domain
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(",") || "*",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// In-memory storage for wallet approvals
const walletApprovals = [];

// POST /api/wallets - receive wallet approval data from dapp
app.post("/api/wallets", (req, res) => {
  const { wallet, amount, txHash, status } = req.body;

  if (!wallet) {
    return res.status(400).json({ error: "wallet is required" });
  }

  const record = {
    id: walletApprovals.length + 1,
    wallet,
    amount: amount || null,
    txHash: txHash || null,
    status: status || "UNKNOWN",
    timestamp: new Date().toISOString(),
  };

  walletApprovals.push(record);

  console.log("📥 Received wallet approval:", record);

  res.status(200).json({
    success: true,
    message: "Wallet approval recorded",
    record,
  });
});

// GET /api/wallets - retrieve all wallet approvals
app.get("/api/wallets", (req, res) => {
  res.status(200).json({
    success: true,
    count: walletApprovals.length,
    records: walletApprovals,
  });
});

// GET /api/wallets/:wallet - retrieve approvals for specific wallet
app.get("/api/wallets/:wallet", (req, res) => {
  const { wallet } = req.params;
  const records = walletApprovals.filter((r) => r.wallet === wallet);

  res.status(200).json({
    success: true,
    wallet,
    count: records.length,
    records,
  });
});

// DELETE /api/wallets - clear all records
app.delete("/api/wallets", (req, res) => {
  const count = walletApprovals.length;
  walletApprovals.length = 0;
  res.status(200).json({
    success: true,
    message: `Cleared ${count} records`,
  });
});

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
    totalRecords: walletApprovals.length,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
