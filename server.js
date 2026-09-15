const express = require('express');
const cors = require('cors');
const { WebUntis } = require('webuntis');

const app = express();
const PORT = process.env.PORT || 8080;

// Allow requests from your GitHub Pages frontend
app.use(cors());

app.get('/api/timetable', async (req, res) => {
    const untis = new WebUntis(
        process.env.UNTIS_SCHOOL,
        process.env.UNTIS_USER,
        process.env.UNTIS_PASS,
        process.env.UNTIS_SERVER
    );

    try {
        await untis.login();
        
        // Correct method name for the webuntis package:
        const timetable = await untis.getOwnTimetableForToday();
        
        await untis.logout();
        res.json(timetable);
    } catch (error) {
        console.error("WebUntis Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
