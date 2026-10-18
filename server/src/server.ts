import express from "express";
import cors from "cors";
import workItemsRouter from "./routes/workItems";
import authRouter from "./routes/auth";
import { authenticate } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/work-items", authenticate, workItemsRouter);

app.get("/", (_req, res) => {
  res.json({
    message: "Newtonite Operations Management API",
    status: "running",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
