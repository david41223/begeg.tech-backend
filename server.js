const express = require('express');
const cors = require('cors');
const { WebUntis } = require('webuntis');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors()); // Allow all origins for now

function parseRequestedDate(value) {
    if (!value) {
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        return today;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        throw new Error('date must use YYYY-MM-DD format');
    }

    const date = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        12,
        0,
        0,
        0
    );

    if (
        date.getFullYear() !== Number(match[1]) ||
        date.getMonth() !== Number(match[2]) - 1 ||
        date.getDate() !== Number(match[3])
    ) {
        throw new Error('date is invalid');
    }

    return date;
}

app.get('/api/timetable', async (req, res) => {
    const untis = new WebUntis(
        process.env.UNTIS_SCHOOL,
        process.env.UNTIS_USER,
        process.env.UNTIS_PASS,
        process.env.UNTIS_SERVER
    );

    try {
        await untis.login();
        
        // Check if the frontend requested a specific date, otherwise use today
        const targetDate = parseRequestedDate(req.query.date);

        // Fetch timetable for the specific date
        const timetable = await untis.getOwnTimetableFor(targetDate);

        // Also fetch upcoming exams to display later!
        const examsStart = new Date(targetDate);
        const examsEnd = new Date(targetDate);
        examsEnd.setDate(examsEnd.getDate() + 30); // Look 30 days ahead
        const exams = await untis.getExamsForRange(examsStart, examsEnd);

        await untis.logout();

        res.json({
            date: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`,
            timetable: timetable,
            exams: exams
        });
    } catch (error) {
        console.error("WebUntis Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
