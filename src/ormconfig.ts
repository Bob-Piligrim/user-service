import { DataSource } from "typeorm";  

export const AppDataSource = new DataSource({ 
    type: "sqlite",
    database: "./data/sqlite.db",
    synchronize: true,
    logging: false,
    entities: [],
    migrations: [],
    subscribers: []    
 })