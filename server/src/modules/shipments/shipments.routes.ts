import { Router } from "express";
import { ShipmentController } from "./shipments.controller";

const router = Router();

router.get("/", ShipmentController.findMany);
router.get("/:id/events", ShipmentController.getEvents);
router.get("/:id/allowed-events", ShipmentController.getAllowedEvents);
router.get("/:id", ShipmentController.findById);
router.post("/", ShipmentController.createShipment);
router.post("/:id/events", ShipmentController.addEvent);
router.patch("/:id/status", ShipmentController.updateStatus);

export default router;
