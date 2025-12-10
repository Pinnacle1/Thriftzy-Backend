import * as dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "./db/data-source";
import app from "./app";

const PORT = parseInt(process.env.PORT || "8000", 10);

(async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
})();