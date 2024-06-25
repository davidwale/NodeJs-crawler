const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');

puppeteerExtra.use(pluginStealth());

async function createBrowser() {
    return await puppeteerExtra.launch({ headless: true });
}

async function scrapeIndeed(page, keyword, location) {
    const IndeedUrl = `https://ng.indeed.com/jobs?q=${keyword || 'developer'}&l=${location || 'lagos'}`;

    try {
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            if (['stylesheet', 'font', 'image'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(IndeedUrl, { timeout: 0 });
        await page.waitForSelector('.job_seen_beacon', { timeout: 0 });

        const jobs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.job_seen_beacon'), (e) => ({
                title: e.querySelector('.jobTitle')?.innerText || 'N/A',
                companyName: e.querySelector('[data-testid=company-name]')?.innerText || 'N/A',
                companyURL: e.querySelector('.base-search-card__subtitle a')?.href || 'N/A',
                jobLocation: e.querySelector('[data-testid=text-location]')?.innerText || 'N/A',
                jobDuration: e.querySelector('[data-testid=myJobsStateDate]')?.innerText || 'N/A',
                jobURL: e.querySelector('a')?.href || 'N/A',
            }))
        );
        return jobs;
    } catch (error) {
        console.error(error);
        throw new Error('Error scraping Indeed: ' + error.message);
    }
}

async function scrapeLinkedIn(page, keyword, location) {
    const linkedinUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keyword || 'developer'}&location=${location || 'lagos'}`;

    try {
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            if (['stylesheet', 'font', 'image'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(linkedinUrl, { timeout: 0 });
        await page.waitForSelector('li', { timeout: 0 });

        const jobs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('li'), (e) => ({
                title: e.querySelector('.base-search-card__title')?.innerText || 'N/A',
                companyName: e.querySelector('.base-search-card__subtitle a')?.innerText || 'N/A',
                companyURL: e.querySelector('.base-search-card__subtitle a')?.href || 'N/A',
                jobLocation: e.querySelector('.job-search-card__location')?.innerText || 'N/A',
                jobDuration: e.querySelector('time')?.innerText || 'N/A',
                jobURL: e.querySelector('a.base-card__full-link')?.href || 'N/A',
            }))
        );
        return jobs;
    } catch (error) {
        console.error(error);
        throw new Error('Error scraping LinkedIn: ' + error.message);
    }
}

async function scrapeJobberman(page, keyword, location) {
    const jobbermanUrl = `https://www.jobberman.com/jobs?q=${keyword || 'developer'}&l=${location || 'lagos'}`;

    try {
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setRequestInterception(true);

        page.on('request', (req) => {
            if (['stylesheet', 'font', 'image'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(jobbermanUrl, { timeout: 0 });
        await page.waitForSelector('[data-cy=listing-cards-components]', { timeout: 0 });

        const jobs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('[data-cy=listing-cards-components]'), (e) => ({
                title: e.querySelector('[data-cy=listing-title-link]')?.innerText || 'N/A',
                companyName: e.querySelector('.text-loading-animate-link')?.innerText || 'N/A',
                companyURL: e.querySelector('.text-loading-animate-link')?.href || 'N/A',
                jobLocation: e.querySelector('.text-loading-hide')?.innerText || 'N/A',
                jobDuration: e.querySelector('p .text-loading-animate')?.innerText || 'N/A',
                jobURL: e.querySelector('[data-cy=listing-title-link]')?.href || 'N/A',
            }))
        );
        return jobs;
    } catch (error) {
        console.error(error);
        throw new Error('Error scraping Jobberman: ' + error.message);
    }
}

async function scrapeAllPlatforms(keyword, location) {
    const browser = await createBrowser();

    try {
        const pageIndeed = await browser.newPage();
        const pageLinkedIn = await browser.newPage();
        const pageJobberman = await browser.newPage();

        const [indeedJobs, linkedInJobs, jobbermanJobs] = await Promise.all([
            scrapeIndeed(pageIndeed, keyword, location),
            scrapeLinkedIn(pageLinkedIn, keyword, location),
            scrapeJobberman(pageJobberman, keyword, location)
        ]);

        return [...indeedJobs, ...linkedInJobs, ...jobbermanJobs];
    } catch (error) {
        console.error(error);
        throw new Error('Error scraping all platforms: ' + error.message);
    } finally {
        await browser.close();
    }
}

module.exports = {
    scrapeIndeed,
    scrapeLinkedIn,
    scrapeJobberman,
    scrapeAllPlatforms,
};
