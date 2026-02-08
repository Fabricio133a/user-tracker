const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;
const { sql, connectDB } = require('./connection')
const setupSwagger = require("./swagger");
const bcrypt = require("bcrypt");

app.use(cors());
app.use(express.json());

setupSwagger(app);

//this is from another script
connectDB();

/**
 * @swagger
 * /student/grade:
 *   post:
 *     summary: Save a student grade
 *     description: Saves letterGrade and percent into the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               letterGrade:
 *                 type: string
 *                 example: A
 *               percent:
 *                 type: integer
 *                 example: 95
 *     responses:
 *       200:
 *         description: Grade saved successfully
 */


app.post("/student/grade", async(req, res) => {
    try{
        const {letterGrade, percent } = req.body;

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
        VALUES (${letterGrade}, ${percentNumber})
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

app.get("/student/grade/", async(req, res) => {
    try {
    const result = await sql.query`
    SELECT Id, LetterGrade, PercentValue
    FROM StudentGrades
    ORDER BY Id DESC
    `;

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

app.get("/student/grade/:StudentID", async(req, res) => {
    try {
        const { StudentID } = req.params;

    const result = await sql.query`
    SELECT Id, StudentID, LetterGrade, PercentValue
    FROM StudentGrades
    WHERE StudentID = ${StudentID}
    ORDER BY Id DESC
    `;

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

app.post("/students", async(req, res) => {
    try{
        const {usernames, password} = req.body;

        if(!usernames || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password required"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await sql.query`
            INSERT INTO StudentInfo (Username, UserPassword)
            VALUES (${usernames}, ${hashedPassword})
        `

        res.json({
            success: true,
            message: "Student created",
            usernames,
            hashedPassword
        });

    } catch(err) {
        console.log("POST /students error:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});