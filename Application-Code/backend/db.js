const mongoose = require("mongoose");

module.exports = async () => {
    // Skip MongoDB connection if not using MongoDB
    if (process.env.USE_MONGODB !== 'true') {
        console.log("Using file-based storage (MongoDB disabled)");
        return;
    }

    try {
        const connectionParams = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        const useDBAuth = process.env.USE_DB_AUTH || false;
        if(useDBAuth){
            connectionParams.user = process.env.MONGO_USERNAME;
            connectionParams.pass = process.env.MONGO_PASSWORD;
        }
        
        if (!process.env.MONGO_CONN_STR) {
            throw new Error("MONGO_CONN_STR environment variable is not set");
        }
        
        await mongoose.connect(
           process.env.MONGO_CONN_STR,
           connectionParams
        );
        console.log("Connected to MongoDB database.");
    } catch (error) {
        const sanitizedError = error.message ? encodeURIComponent(error.message) : 'Unknown error';
        console.log("Could not connect to database.", sanitizedError);
        console.log("Falling back to file-based storage...");
        process.env.USE_MONGODB = 'false';
    }
};
