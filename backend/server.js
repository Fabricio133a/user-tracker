const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;
const { sql, connectDB } = require('../connection')

app.use(cors());
app.use(express.json());

//this is from another script
connectDB();

app.post("/student/grade", async(req, res) => {
    try{
        const { letterGrade, percent } = req.body;

        if(!letterGrade || !percent) {
            return res.json({
                success: false,
                message: "letterGrade or percent are missing"
            });
        }

        res.json({
            success: true,
            message: `Grade received: ${letterGrade}, ${percent}`
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to import grade"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});