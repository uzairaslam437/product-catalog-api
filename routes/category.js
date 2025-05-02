const express = require("express");
const router  = express.Router();

const {pool} = require("../config/db")

router.post("/add", async (req,res)=>{
    try{
        const {name,description} = req.body;

    if(!name){
        console.log("Category name is required.");
        return res.status(400).json({message: "Name, price and category is required"})
    }

    const query = {
        text:`INSERT INTO categories(name,description) VALUES ($1,$2) RETURNING *`,
        values: [name, description || null]
    };

    const queryRes = await pool.query(query);
    const newCategory = queryRes.rows[0];

    console.log(`Added category:${queryRes.rows[0]}`);
    return res.status(200).json({message: "Category successfully added",
        category: newCategory
    })
    }
    catch(error){
        console.log(`Added category:${queryRes.rows[0]}`);
        return res.status(500).json({message: "Internal Server Error",error: error.message})
    }
});

router.put("/update/:id",async (req,res)=>{
    try{
        const recordId = req.params.id;  //WORKNING WITH HEADERS??
    const {name,description} = req.body;

    if(!name){
        console.log("Category name is required.");
        return res.status(400).json({message: "Category is required"})
    }

    const query = {
        text:`UPDATE categories
            SET name = $1 , description = $2
            WHERE id = $3 
        RETURNING *`,
        values: [name, description || null,recordId]
    };

    const queryRes = await pool.query(query);
    const updatedCategory = queryRes.rows[0];

    if(queryRes.rows.length === 0){
        console.log(`Category not found.`);
        return res.status(500).json({message: "Category not found",
            category: updatedCategory
        });
    }

    console.log(`updated category name:${queryRes.rows[0].name}`);
    return res.status(200).json({message: "Category successfully updated",category: updatedCategory})
    }
    catch(error){
        console.log("Internal Server Error",error);
        return res.status(500).json({message:"Internal server error",error: error.message})
    }
});

module.exports = router;