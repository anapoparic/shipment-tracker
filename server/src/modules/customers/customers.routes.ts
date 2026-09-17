// src/features/customers/customers.routes.ts
import { Router } from "express";
import { CustomerController } from "./customers.controller";

const router = Router();

router.get("/", CustomerController.findMany);

export default router;
