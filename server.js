const express = require('express');
const cors = require('cors');
const WebUntis = require('webuntis');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'https://www.begeg.tech' }));

app.get('/api/timetable', async (req, res) => {
    // Initialize WebUntis using environment variables
    const untis = new WebUntis(
        process.env.UNTIS_SCHOOL,
        process.env.UNTIS_USER,
        process.env.UNTIS_PASS,
        process.env.UNTIS_SERVER
    );

    try {
        await untis.login();
        const timetable = await untis.getOwnTimetable();
        await untis.logout();
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
