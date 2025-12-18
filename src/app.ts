import express from "express";
import cors from "cors";
import requestLogger from "./middleware/requestLogger";

// Import all module routes
import { authRoutes } from "./modules/auth";
import { userRoutes } from "./modules/users";
import { sellerRoutes } from "./modules/seller";
import { productRoutes } from "./modules/products";
import { storeRoutes } from "./modules/stores";
import { cartRoutes } from "./modules/carts";
import { orderRoutes } from "./modules/orders";
import { addressRoutes } from "./modules/addresses";
import { reviewRoutes } from "./modules/reviews";
import { verificationRoutes } from "./modules/verification/verification.routes";
import { sellerDocumentsRoutes } from "./modules/sellerDocuments/sellerDocuments.routes";
import { adminRoutes } from "./modules/admin";
import { payoutRoutes } from "./modules/payouts";
import { supportRoutes } from "./modules/support";

const app = express();

// ============== MIDDLEWARES ==============

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ============== ROUTES ==============

// Auth routes - /auth/*
app.use("/auth", authRoutes);

// User routes - /users/*
app.use("/users", userRoutes);

// Seller routes - /seller/* (includes /seller/documents/*)
app.use("/seller", sellerRoutes);

// Product routes - /products/* (public buyer browsing)
app.use("/products", productRoutes);

// Store routes - /stores/* (public buyer browsing)
app.use("/stores", storeRoutes);

// Cart routes - /cart/* (authenticated users)
app.use("/cart", cartRoutes);

// Order routes - /orders/* (authenticated users)
app.use("/orders", orderRoutes);

// Address routes - /addresses/* (authenticated users)
app.use("/addresses", addressRoutes);

// Review routes - /reviews/* (mixed public/authenticated)
app.use("/reviews", reviewRoutes);

// Verification routes - /verify/* (OTP testing)
app.use("/verify", verificationRoutes);

// Seller Documents routes - /seller/kyc/*
app.use("/seller/kyc", sellerDocumentsRoutes);

// Admin routes - /admin/* (admin authentication and management)
app.use("/admin", adminRoutes);

// Payout routes - /payouts/* (seller payouts)
app.use("/payouts", payoutRoutes);

// Support routes - /support/* (customer support tickets)
app.use("/support", supportRoutes);

// ============== HEALTH CHECK ==============

app.get("/health", (req, res) => res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
}));

// ============== 404 HANDLER ==============

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// ============== ERROR HANDLER ==============

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

export default app;
