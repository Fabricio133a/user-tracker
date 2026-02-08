const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;
const { sql, connectDB } = require('./connection')

app.use(cors());
app.use(express.json());

//this is from another script
connectDB();

app.post("/student/grade", async(req, res) => {
    try{
        const { letterGrade, percent } = req.body;

        if(!letterGrade || percent === undefined) {
            return res.json({
                success: false,
                message: "letterGrade or percent are missing"
            });
        }

       const percentNumber = Number(percent);

       if(Number.isNaN(percentNumber) || percentNumber < 0 || percentNumber > 100) {
        return res.status(400).json({
            success: false,
            message: "percent must be a number between 0 and 100"
        });
       }

       await sql.query`
        INSERT INTO StudentGrades (LetterGrade, PercentValue)
        VALUES (${letterGrade}. ${percentNumber})
       `;

       return res.json({
        success: true,
        message: `Saved grade: ${letterGrade} (${percentNumber}%)`
       });

    } catch (err) {
        console.error("POST /student/grade error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to import grade"
        });
    }
});

app.get("/student/grade", async(req, res) => {
    try {
    const result = await sql.query(`
    SELECT Id, LetterGrade, PercentValue
    FROM StudentGrades
    ORDER BY Id DESC
    `);

        //github is saving this

    return res.json({
        success: true,
        grades: result.recordset
    });
    } catch(err) {
        console.error("GET / student/grade error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch Grades"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});