import { asyncHandler } from '../helpets/asyncHandler.js';
import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import {
  blockUser,
  getAllUsers,
  getUserById,
  loginUser,
  registerUser,
} from "../controller/userController.js";
import {
  adminOrOwnerMiddleware,
  authMiddleware,
} from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", asyncHandler(registerUser));

router.post("/login", asyncHandler(loginUser));

router.get("/:id", authMiddleware, adminOrOwnerMiddleware, asyncHandler(getUserById));

router.get(
  "/",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin")
      return next({status: 403, message: "Нет прав доступа"});
    next();
  },
  asyncHandler(getAllUsers)
);

router.patch("/:id/block", authMiddleware, adminOrOwnerMiddleware, asyncHandler(blockUser));

export default router;
