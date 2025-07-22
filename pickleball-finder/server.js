const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

class PickleballScraper {
    constructor() {
        this.browser = null;
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }

    async searchPickleballCourts() {
        if (!this.browser) {
            await this.initialize();
        }

        const page = await this.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        try {
            const searchQueries = [
                'pickleball courts Singapore',
                'pickleball facilities Singapore',
                'Singapore pickleball booking',
                'SAFRA pickleball Singapore',
                'ActiveSG pickleball courts'
            ];

            const allResults = [];

            for (const query of searchQueries) {
                const results = await this.performSearch(page, query);
                allResults.push(...results);
            }

            // Remove duplicates based on name
            const uniqueResults = this.removeDuplicates(allResults);
            
            // Enhance results with additional link finding
            const enhancedResults = await this.enhanceResults(page, uniqueResults);

            return enhancedResults;

        } finally {
            await page.close();
        }
    }

    async performSearch(page, query) {
        try {
            await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            // Wait for search results
            await page.waitForSelector('div[data-ved]', { timeout: 10000 });

            const results = await page.evaluate(() => {
                const searchResults = [];
                const resultElements = document.querySelectorAll('div[data-ved]');

                resultElements.forEach((element, index) => {
                    if (index >= 10) return; // Limit to first 10 results

                    const titleElement = element.querySelector('h3');
                    const linkElement = element.querySelector('a[href]');
                    const snippetElement = element.querySelector('[data-snf="nke7rc"]') || 
                                         element.querySelector('.VwiC3b');

                    if (titleElement && linkElement) {
                        const title = titleElement.textContent.trim();
                        const url = linkElement.href;
                        const snippet = snippetElement ? snippetElement.textContent.trim() : '';

                        // Filter for Singapore-related pickleball results
                        if ((title.toLowerCase().includes('pickleball') || 
                             snippet.toLowerCase().includes('pickleball')) &&
                            (title.toLowerCase().includes('singapore') || 
                             snippet.toLowerCase().includes('singapore') ||
                             url.includes('.sg'))) {
                            
                            searchResults.push({
                                name: title,
                                description: snippet,
                                website: url,
                                googleMaps: null,
                                booking: null,
                                instagram: null
                            });
                        }
                    }
                });

                return searchResults;
            });

            return results;

        } catch (error) {
            console.error(`Error searching for ${query}:`, error);
            return [];
        }
    }

    async enhanceResults(page, results) {
        const enhanced = [];

        for (const result of results) {
            try {
                const enhancedResult = await this.findAdditionalLinks(page, result);
                enhanced.push(enhancedResult);
            } catch (error) {
                console.error(`Error enhancing result for ${result.name}:`, error);
                enhanced.push(result);
            }
        }

        return enhanced;
    }

    async findAdditionalLinks(page, courtData) {
        try {
            if (!courtData.website || courtData.website.includes('google.com/search')) {
                return courtData;
            }

            await page.goto(courtData.website, { 
                waitUntil: 'networkidle0', 
                timeout: 15000 
            });

            const links = await page.evaluate(() => {
                const result = {
                    googleMaps: null,
                    booking: null,
                    instagram: null
                };

                // Find all links on the page
                const allLinks = Array.from(document.querySelectorAll('a[href]'));

                allLinks.forEach(link => {
                    const href = link.href.toLowerCase();
                    const text = link.textContent.toLowerCase();

                    // Google Maps links
                    if (href.includes('maps.google') || href.includes('goo.gl/maps') || 
                        text.includes('map') || text.includes('location') || text.includes('direction')) {
                        if (!result.googleMaps && href.includes('google')) {
                            result.googleMaps = link.href;
                        }
                    }

                    // Booking links
                    if (text.includes('book') || text.includes('reserve') || text.includes('schedule') ||
                        href.includes('booking') || href.includes('reserve') || href.includes('schedule')) {
                        if (!result.booking) {
                            result.booking = link.href;
                        }
                    }

                    // Instagram links
                    if (href.includes('instagram.com')) {
                        if (!result.instagram) {
                            result.instagram = link.href;
                        }
                    }
                });

                // Also check meta tags and structured data
                const ogUrl = document.querySelector('meta[property="og:url"]');
                if (ogUrl && ogUrl.content.includes('instagram.com') && !result.instagram) {
                    result.instagram = ogUrl.content;
                }

                return result;
            });

            return {
                ...courtData,
                googleMaps: links.googleMaps || courtData.googleMaps,
                booking: links.booking || courtData.booking,
                instagram: links.instagram || courtData.instagram
            };

        } catch (error) {
            console.error(`Error finding additional links for ${courtData.name}:`, error);
            return courtData;
        }
    }

    removeDuplicates(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = result.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}

// API endpoints
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/search-courts', async (req, res) => {
    const scraper = new PickleballScraper();
    
    try {
        console.log('Starting court search...');
        const courts = await scraper.searchPickleballCourts();
        console.log(`Found ${courts.length} courts`);
        res.json({ courts });
    } catch (error) {
        console.error('Error searching courts:', error);
        res.status(500).json({ error: 'Failed to search for courts' });
    } finally {
        await scraper.close();
    }
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`You can access the webapp at: http://localhost:${PORT}`);
});