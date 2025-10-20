import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./ormconfig.js";
import router from "./routes/userRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/users', router)



const PORT = process.env.PORT || 3000

app.get("/", (req, res) => res.send("Привет, Мир!"));


app.use(errorMiddleware)

AppDataSource.initialize()
  .then(() => {
    console.log("База данных успешно подключена");
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Во время подключения к базе данных произошла ошибка:", err);
  });
