const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

const { sql, connectDB } = require("./connection");
const setupSwagger = require("./swagger");
const bcrypt = require("bcrypt");

app.use(cors());
app.use(express.json());

setupSwagger(app);
connectDB();

/**
 * =========================================================
 * SWAGGER DOCS
 * =========================================================
 */

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a student account
 *     description: Creates a student in StudentInfo with a hashed password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usernames:
 *                 type: string
 *                 example: alex
 *               password:
 *                 type: string
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Student created successfully
 */

/**
 * @swagger
 * /student/grade:
 *   post:
 *     summary: Save a global grade (not linked to a student)
 *     description: Saves a grade into StudentGrades table
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
 *
 *   get:
 *     summary: Get all global grades
 *     description: Returns all grades from StudentGrades table
 *     responses:
 *       200:
 *         description: Grades fetched successfully
 */

/**
 * @swagger
 * /student/grade/{StudentID}:
 *   post:
 *     summary: Save a grade for one student
 *     description: Saves a grade into LocalStudentGrade table for a specific student
 *     parameters:
 *       - in: path
 *         name: StudentID
 *         required: true
 *         schema:
 *           type: string
 *         example: alex
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
 *                 example: 90
 *     responses:
 *       200:
 *         description: Student grade saved successfully
 *
 *   get:
 *     summary: Get grades for one student
 *     description: Returns all grades for a specific StudentID from LocalStudentGrade table
 *     parameters:
 *       - in: path
 *         name: StudentID
 *         required: true
 *         schema:
 *           type: string
 *         example: alex
 *     responses:
 *       200:
 *         description: Student grades fetched successfully
 */

/**
 * =========================================================
 * ROUTES
 * =========================================================
 */

// ✅ Create student
app.post("/students", async (req, res) => {
  try {
    const { usernames, password } = req.body;

    if (!usernames || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql.query`
      INSERT INTO StudentInfo (Username, UserPassword)
      VALUES (${usernames}, ${hashedPassword})
    `;

    return res.json({
      success: true,
      message: "Student created",
      usernames,
    });
  } catch (err) {
    console.log("POST /students error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ✅ POST global grade (not linked to student)
app.post("/student/grade", async (req, res) => {
  try {
    const { letterGrade, percent } = req.body;

    if (!letterGrade || percent === undefined) {
      return res.status(400).json({
        success: false,
        message: "letterGrade or percent are missing",
      });
    }

    const percentNumber = Number(percent);

    if (
      Number.isNaN(percentNumber) ||
      percentNumber < 0 ||
      percentNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "percent must be a number between 0 and 100",
      });
    }

    await sql.query`
      INSERT INTO StudentGrades (LetterGrade, PercentValue)
      VALUES (${letterGrade}, ${percentNumber})
    `;

    return res.json({
      success: true,
      message: `Saved global grade: ${letterGrade} (${percentNumber}%)`,
    });
  } catch (err) {
    console.error("POST /student/grade error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save grade",
    });
  }
});

// ✅ GET all global grades
app.get("/student/grade", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT Id, LetterGrade, PercentValue
      FROM StudentGrades
      ORDER BY Id DESC
    `;

    return res.json({
      success: true,
      grades: result.recordset,
    });
  } catch (err) {
    console.error("GET /student/grade error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch grades",
    });
  }
});

// ✅ POST grade for one student
app.post("/student/grade/:StudentID", async (req, res) => {
  try {
    const { StudentID } = req.params;
    const { letterGrade, percent } = req.body;

    if (!StudentID || !letterGrade || percent === undefined) {
      return res.status(400).json({
        success: false,
        message: "StudentID, letterGrade, or percent are missing",
      });
    }

    const percentNumber = Number(percent);

    if (
      Number.isNaN(percentNumber) ||
      percentNumber < 0 ||
      percentNumber > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "percent must be a number between 0 and 100",
      });
    }

    await sql.query`
      INSERT INTO LocalStudentGrade (StudentID, LetterGrade, PercentValue)
      VALUES (${StudentID}, ${letterGrade}, ${percentNumber})
    `;

    return res.json({
      success: true,
      message: `Saved grade for ${StudentID}: ${letterGrade} (${percentNumber}%)`,
    });
  } catch (err) {
    console.error("POST /student/grade/:StudentID error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save student grade",
    });
  }
});

// ✅ GET grades for one student
app.get("/student/grade/:StudentID", async (req, res) => {
  try {
    const { StudentID } = req.params;

    const result = await sql.query`
      SELECT StudentID, LetterGrade, PercentValue
      FROM LocalStudentGrade
      WHERE StudentID = ${StudentID}
      ORDER BY PercentValue DESC
    `;

    return res.json({
      success: true,
      grades: result.recordset,
    });
  } catch (err) {
    console.error("GET /student/grade/:StudentID error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student grades",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
