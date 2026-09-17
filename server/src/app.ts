import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/error.middleware";
import shipmentRoutes from "./modules/shipments/shipments.routes";
import customerRoutes from "./modules/customers/customers.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Shipment API is running smoothly" });
});

app.use("/api/shipments", shipmentRoutes);
app.use("/api/customers", customerRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
