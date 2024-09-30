console.log("Notes Backend Starting");
import app from "./app.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`Server is running on port ${PORT}`));
