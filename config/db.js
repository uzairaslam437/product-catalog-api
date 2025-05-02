const {Pool} = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

const initDB = async  () =>{
    const client = await pool.connect();
    
    try{     
        await client.query(
            `CREATE TABLE IF NOT EXISTS categories(
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`
        );

        await client.query(
            `CREATE TABLE IF NOT EXISTS products(
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
                category_id INTEGER NOT NULL 
                    REFERENCES categories(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`
        );

        console.log('Database initialized successfully')
    }
    catch(err){
        console.log("Error initializing Database: ",err)
    }
    finally{
        client.release();
    }

}



module.exports = {initDB,pool};