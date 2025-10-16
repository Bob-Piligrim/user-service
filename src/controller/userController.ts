import { error } from "console";
import { Role, Status, User } from "../entity/User.js";
import { AppDataSource } from "../ormconfig.js";
import type { Request, Response } from "express";
import * as jwt from "jsonwebtoken";

const userRepository = AppDataSource.getRepository(User);

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, dateOfBirth, email, password, role } = req.body;

    if (!fullName || !dateOfBirth || !email || !password || !role) {
      return res.status(400).json({ message: "Отсутствует обязательное поле" });
    }

    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким email уже существует!" });
    }

    const user = new User();
    user.fullName = fullName;
    user.dateOfBirth = dateOfBirth;
    user.email = email;
    user.password = password;
    user.role = role === "admin" ? Role.ADMIN : Role.USER;
    user.status = Status.ACTIVE;

    await userRepository.save(user);

    return res.status(201).json({ message: "Польщователь успешно создан!" });
  } catch (err) {
    return res.status(500).json({ message: "Ошибка сервера", error: err });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Отсутствует email или пароль" });
    }

    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Неверный пароль" });
    }

    if (user.status === Status.INACTIVE) {
      return res.status(400).json({ message: "Пользователь заблокирован" });
    }

    const payload = {
      userId: user.id,
      userRole: user.role,
    };

    const secret = process.env.JWT_SECRET || "secret";
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    return res.json({ token });
  } catch (err) {
    console.error("Ошибка сервера", err);
    return res.status(500).json({ message: "Ошибка сервера", error: err });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userRepository.findOneBy({ id });

    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (err) {
    console.error("Ошибка сервера", err);
    return res.status(500).json({ message: "Ошибка сервера", error: err });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepository.find();

    const result = users.map(({ password, ...rest }) => rest);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: "Ошибка сервера", error: err });
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const user = await userRepository.findOneBy({ id });
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    user.status = Status.INACTIVE;
    await userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return res.json({
      message: "Пользователь заблокирован",
      user: userWithoutPassword,
    });
  } catch (err) {
    return res.status(500).json({ message: "Ошибка сервера", error: err });
  }
};
