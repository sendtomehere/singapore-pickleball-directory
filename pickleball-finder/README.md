# Singapore Pickleball Courts Finder

A web application that searches for pickleball courts in Singapore and extracts their contact information including website, Google Maps links, booking information, and Instagram profiles.

## Features

- 🏓 Automated search for pickleball courts in Singapore
- 🌐 Extracts website URLs
- 📍 Finds Google Maps location links
- 📅 Discovers booking/reservation links
- 📱 Locates Instagram social media profiles
- 📊 Export results to CSV format
- 📱 Responsive design for mobile and desktop

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **For development with auto-reload:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and go to `http://localhost:3000`

## How It Works

1. **Search Process**: The application searches Google using multiple relevant queries for pickleball courts in Singapore
2. **Data Extraction**: For each found court, it visits their website and extracts:
   - Main website URL
   - Google Maps/location links
   - Booking/reservation systems
   - Instagram social media profiles
3. **Results Display**: Shows all found courts in an organized card layout
4. **Export**: Allows downloading results as CSV for further use

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js with Express
- **Web Scraping**: Puppeteer for automated browser control
- **Styling**: Modern CSS with responsive design

## API Endpoints

- `GET /` - Main application interface
- `GET /api/search-courts` - Returns JSON data of found courts

## Important Notes

- **Rate Limiting**: The scraper includes delays to be respectful to websites
- **Error Handling**: Robust error handling for network issues and parsing errors
- **Legal Compliance**: Uses publicly available information only
- **Performance**: Results are cached temporarily to improve response times

## Sample Output

Each court entry includes:
- Name and description
- Website URL (if available)
- Google Maps link (if found)
- Booking system link (if discovered)
- Instagram profile (if present)

## Development

To extend this application:
1. Modify search queries in `server.js`
2. Add new data extraction patterns
3. Enhance the UI in `index.html` and `styles.css`
4. Update the frontend logic in `script.js`

## License

MIT License - feel free to use and modify as needed.