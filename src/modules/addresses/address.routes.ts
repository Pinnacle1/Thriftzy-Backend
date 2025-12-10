import { Router, Request, Response } from "express";
import { addressController } from "./address.controller";
import { authenticate } from "../auth/auth.middleware";

const router = Router();

// ============== ALL ROUTES REQUIRE AUTHENTICATION ==============

router.use(authenticate);

/**
 * @route   GET /addresses
 * @desc    Get all addresses for the current user
 * @access  Private
 */
router.get("/", (req: Request, res: Response) =>
    addressController.getAddresses(req, res)
);

/**
 * @route   GET /addresses/default
 * @desc    Get default address
 * @access  Private
 */
router.get("/default", (req: Request, res: Response) =>
    addressController.getDefaultAddress(req, res)
);

/**
 * @route   GET /addresses/formatted
 * @desc    Get formatted addresses for dropdown/display
 * @access  Private
 */
router.get("/formatted", (req: Request, res: Response) =>
    addressController.getFormattedAddresses(req, res)
);

/**
 * @route   GET /addresses/:id
 * @desc    Get address by ID
 * @access  Private
 */
router.get("/:id", (req: Request, res: Response) =>
    addressController.getAddressById(req, res)
);

/**
 * @route   POST /addresses
 * @desc    Create a new address
 * @access  Private
 * @body    { name, phone, line1, line2?, city, state, country, pincode, is_default? }
 */
router.post("/", (req: Request, res: Response) =>
    addressController.createAddress(req, res)
);

/**
 * @route   PATCH /addresses/:id
 * @desc    Update an address
 * @access  Private
 * @body    { name?, phone?, line1?, line2?, city?, state?, country?, pincode?, is_default? }
 */
router.patch("/:id", (req: Request, res: Response) =>
    addressController.updateAddress(req, res)
);

/**
 * @route   PUT /addresses/:id/default
 * @desc    Set address as default
 * @access  Private
 */
router.put("/:id/default", (req: Request, res: Response) =>
    addressController.setDefaultAddress(req, res)
);

/**
 * @route   DELETE /addresses/:id
 * @desc    Delete an address
 * @access  Private
 */
router.delete("/:id", (req: Request, res: Response) =>
    addressController.deleteAddress(req, res)
);

export { router as addressRoutes };
