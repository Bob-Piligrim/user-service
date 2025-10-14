import "reflect-metadata";
import express from "express";  

const app = express();
const PROT = 3000;

app.get("/", (req, res) => res.send("Hello World"));

app.listen(PROT, () => console.log(`Сервер работает на порту ${PROT}`));
