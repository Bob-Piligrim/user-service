import { Role, Status, User } from "../entity/User.js";
import { AppDataSource } from "../ormconfig.js";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const userRepository = AppDataSource.getRepository(User);

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fullName, dateOfBirth, email, password, role } = req.body;

  if (!fullName || !dateOfBirth || !email || !password || !role) {
    return next({ status: 400, message: "Отсутствует обязательное поле" });
  }

  const existingUser = await userRepository.findOneBy({ email });
  if (existingUser) {
    return next({
      status: 400,
      message: "Пользователь с таким email уже существует!",
    });
  }

  const user = new User();
  user.fullName = fullName;
  user.dateOfBirth = dateOfBirth;
  user.email = email;
  user.password = password;
  user.role = role === "admin" ? Role.ADMIN : Role.USER;
  user.status = Status.ACTIVE;

  await userRepository.save(user);

  return res.status(201).json({ message: "Пользователь успешно создан!" });
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next({ status: 400, message: "Отсутствует email или пароль " });
  }

  const user = await userRepository.findOneBy({ email });

  if (!user) {
    return next({ status: 400, message: "Пользователь не найден" });
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return next({ status: 400, message: "Неверный пароль " });
  }

  if (user.status === Status.INACTIVE) {
    return next({ status: 400, message: "Пользователь заблокирован" });
  }

  const payload = {
    userId: user.id,
    userRole: user.role,
  };
  console.log("payload", payload);

  const secret = process.env.JWT_SECRET || "secret";
  const token = jwt.sign(payload, secret, { expiresIn: "1h" });

  return res.json({ token });
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const user = await userRepository.findOneBy({ id });

  if (!user) {
    return next({ status: 400, message: "Пользователь не найден" });
  }

  const { password, ...userWithoutPassword } = user;
  return res.json(userWithoutPassword);
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const users = await userRepository.find();

  const result = users.map(({ password, ...rest }) => rest);

  if (result === null || result === undefined) {
    throw new Error("Ошибка сервера, пользователи не найдены");
  }

  return res.json(result);
};

export const blockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const user = await userRepository.findOneBy({ id });
  if (!user) {
    return next({ status: 400, message: "Пользователь не найден" });
  }

  if (user.role === "admin") {
    return next({
      status: 400,
      message: "Пользователь является администратором",
    });
  }

  user.status = Status.INACTIVE;
  await userRepository.save(user);

  const { password, ...userWithoutPassword } = user;
  return res.json({
    message: "Пользователь заблокирован",
    user: userWithoutPassword,
  });
};
