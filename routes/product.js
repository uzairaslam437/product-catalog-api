const express = require("express");
const router = express.Router();
const {pool} = require("../config/db")

router.post("/add", async (req,res)=>{
    try{
        const {name,description,price,category_id} = req.body;

        if(!name || price === undefined  || !category_id){
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

});

router.put("/update/:id", async (req,res)=>{
    try{
        const productId = req.params.id;
        const {name,description,price,category_id} = req.body;

        if(Object.keys(req.body) === 0){
            console.log("No data found to update!")
            return res.status(404).json({message: "No data found to update!"});
        }

        const findProduct = {
            text: `SELECT 1 FROM products WHERE id = $1`,
            values: [productId]
        }

        const productRecord = await pool.query(findProduct);

        if(productRecord.rowcount === 0){
            console.log("Product not found");
            return res.status(400).json({message: `Product with Id: ${productId} not found`});
        }
  
        
        if (price !== undefined){
            if(typeof price !== "number" || price < 0){
                console.log("Price must be a posative integar.")
                return res.status(400).json({message: "Price must be a posative integar."})
            }
        }

    
        if(category_id !== undefined){
            const categoryCheck = await pool.query(`SELECT 1 FROM categories WHERE id = $1`,
                [category_id]);
    
            if(categoryCheck.rowCount === 0){
                console.log("Category not found!");
                return res.status(400).json({message: "Category not found!"})
            }
        }

        let whereConditions = [];
        let values = [];
        let paramCount = 1;

        if(name !== undefined){
            whereConditions.push(`name = $${paramCount++}`);
            values.push(name);
        }

        if(description !== undefined){
            whereConditions.push(`description = $${paramCount++}`);
            values.push(description);
        }

        if(price !== undefined){
            whereConditions.push(`price = $${paramCount++}`);
            values.push(parseFloat(price));
        }

        if(category_id !== undefined){
            whereConditions.push(`category_id = $${paramCount++}`);
            values.push(category_id);
        }
        whereConditions.push(" updated_at = CURRENT_TIMESTAMP ")
        values.push(productId);

        console.log(`Where conditions: ${whereConditions}`);
        console.log(`Values: ${values}`)
        const query = {
            text: `UPDATE products 
                SET ${whereConditions.join(" , ")}
                WHERE id = $${paramCount} RETURNING *`,
            values: [...values]
        };

        const result = await pool.query(query);
        const updatedProduct = result.rows[0];


        console.log(`Product updated successfully. Name: ${updatedProduct.name} price: ${updatedProduct.price}`);
        return res.status(200).json({message: `Product updated successfully.` , product: updatedProduct});

    }
    catch(error){
        console.log("Error updating Product. Error: ",error);
        return res.status(500).json({message: "Error updating product",error: error.message})
    }

});

router.get("/fetch",async (req,res)=>{
    try{
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const offset = (page - 1) * limit;

        const categoryId = req.query.category;
        const minPrice = req.query.minPrice;
        const maxPrice = req.query.maxPrice;

        let whereConditions = [];
        let values = [];
        let paramCount = 1;

        if(categoryId !== undefined){
            whereConditions.push(` category_id = $${paramCount++} `);
            values.push(categoryId);
        }

        if(minPrice !== undefined){
            whereConditions.push(` price >= $${paramCount} `);
            values.push(minPrice);
        }

        if(maxPrice !== undefined){
            whereConditions.push(` price <= $${paramCount} `);
            values.push(maxPrice);
        }

        const whereClause = whereConditions.length !== 0? 
        `WHERE ${whereConditions.join(" , ") }` :
        ""

        const countQuery = {
            text: `SELECT COUNT(*) FROM products ${whereClause}`,
            values: [...values]
        }

        const dataQuery = {
            text: `SELECT * FROM products ${whereClause} ORDEY BY id OFFSET $${paramCount++} LIMIT $${parmaCount++}`,
            values: [...values,offset,limit]
        };

        const [countRes,dataRes] = await Promise.all([  //REVIEW LATER
            pool.query(countQuery),
            pool.query(dataQuery)
        ])

        const totalProducts = countRes.rows.length;
        const totalPages = Math.ceil(totalProducts/limit);

        return res.status(200).json({products: dataRes.rows,
        pagination: {
            total: totalProducts,
            totalPages,
            currentPage: page,
            pageSize: limit,
            hasNext: page < totalPages,
            hasPrevious: page > 1
      }})
    }
    catch(error){
        console.log("Error fetching products. Error:",error);
        return res.status(500).json({message:`Error fetching products`,error: error.message })
    }
});

module.exports = router;