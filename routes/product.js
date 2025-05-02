const express = require("express");
const router = express.Router();
const {pool} = require("../config/db")

router.post("/add", async (req,res)=>{
    try{
        const {name,description,price,category_id} = req.body;

        if(!(name || price || category_id)){
            console.log("Name price and category are required.");
            return res.status(400).json({message: `Name price and category are required.`});
        }    
        
        if(typeof price !== "number" || price < 0){
            console.log("Price must be a posative integar.")
            return res.status(400).json({message: "Price must be a posative integar."})
        }

    
        const categoryCheck = await pool.query(`SELECT 1 FROM categories WHERE id = $1`,
            [category_id]);

        if(categoryCheck.rowCount === 0){
            console.log("Category not found!");
            return res.status(400).json({message: "Category not found!"})
        }

        const query = {
            text: `INSERT INTO products (name,description,price,category_id) VALUES ($1,$2,$3,$4) RETURNING *`,
            values: [name,description,price,category_id]
        }

        const addedRecord = await pool.query(query);

        console.log(`Product added successfully Name: ${addedRecord.rows[0].name} price: ${addedRecord.rows[0].price}`);
        return res.status(201).json({message:`Product added successfully` , product : addedRecord.rows[0] })
    }
    catch(error){
        console.log(`Error adding product: ${error}`)
        return res.status(500).json({message:`Error adding Product`,error: error.message })
    }

})

module.exports = router;