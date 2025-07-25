// Import Packages
import { config } from "dotenv"; config();
import Database from "../Classes/Database/Database.js"

const Mongo = new Database(process.env.MONGOUSERNAME, process.env.MONGOPASSWORD)

// Calling database connect method for connecting to MongoDB Database
export default class DatabaseHandler {
    static async Start() {
        await Mongo.Connect()
    }
}