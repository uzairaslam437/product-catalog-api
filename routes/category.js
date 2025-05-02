const express = require("express");
const router  = express.Router();

const {pool} = require("../config/db")

router.post("/add", async (req,res)=>{
    const {name,description} = req.body;

    if(!name){
        console.log("Category name is required.");
        res.status(400).json({message: "Name, price and category is required"})
    }

    const query = {
        text:`INSERT INTO categories(name,description) VALUES ($1,$2) RETURNING *`,
        values: [name, description || null]
    };

    const queryRes = await pool.query(query);

    if(queryRes.rows.length === 0){
        console.log(`Error adding category.`);
        res.status(500).json({message: "Error adding category"});
    }

    console.log(`Added category:${queryRes.rows[0]}`);
    res.status(200).json({message: "Category successfully added"})
});

router.put("/update/:id",async (req,res)=>{
    const recordId = req.params.id;  //WORKNING WITH HEADERS??
    const {name,description} = req.body;

    if(!name){
        console.log("Category name is required.");
        res.status(400).json({message: "Category is required"})
    }

    const query = {
        text:`UPDATE categories
            SET name = $1 , description = $2
            WHERE id = $3 
        RETURNING *`,
        values: [name, description || null,recordId]
    };

    const queryRes = await pool.query(query);

    if(queryRes.rows.length === 0){
        console.log(`Error updating category.`);
        res.status(500).json({message: "Error updating category"});
    }

    console.log(`updated category name:${queryRes.rows[0].name}`);
    res.status(200).json({message: "Category successfully updated"})
})

module.exports = router;