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

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/:id", authMiddleware, adminOrOwnerMiddleware, getUserById);

router.get(
  "/",
  authMiddleware,
  (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin")
      return res.status(403).json({ message: "Нет прав доступа" });
    next();
  },
  getAllUsers
);

router.patch("/:id/block", authMiddleware, adminOrOwnerMiddleware, blockUser);

export default router;
