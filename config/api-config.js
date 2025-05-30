module.exports = {
    API_KEY: process.env.FOOTBALL_API_KEY,
    RIVER_PLATE_TEAM_ID: 451, // ID de River Plate
    API_FOOTBALL_URL: 'https://api-football-v1.p.rapidapi.com/v3',
    HEADERS: {
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        'x-rapidapi-key': process.env.FOOTBALL_API_KEY
    }
}; 