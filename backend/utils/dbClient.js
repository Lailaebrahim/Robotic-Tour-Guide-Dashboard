/**
 * DBClient class to handle MongoDB connection.
 */
import mongoose from "mongoose";


class DBClient {
    /**
     * constructor for the DBClient class.
     * sets the URI for the MongoDB connection and calls the connect method
     * to establish a connection.
     */
    constructor() {
        this.uri = process.env.MONGODB_URI;
        this.connection = null;
        this.connect();
    }

    /**
     * connects to the MongoDB database using mongoose.
     * logs a success message if connected, otherwise logs an error.
     * @async
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            this.connection = await mongoose.connect(this.uri);
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error(`MongoDB connection error: ${error}`);
        }
    }

    /**
     * checks if the MongoDB connection is alive.
     * @returns {boolean} true if the connection is alive, otherwise false.
     */
    isAlive() {
        return mongoose.connection.readyState === 1;
    }
}

export default DBClient;