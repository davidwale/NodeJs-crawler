const puppeteer = require('puppeteer');

async function scrapeLinkedIn(keyword, location) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const linkedinUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keyword}&location=${location}`;

    try {
        page.setDefaultNavigationTimeout(0);
        await page.goto(linkedinUrl);
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
        throw new Error('Error scraping LinkedIn');
    } finally {
        await browser.close();
    }
}

async function scrapeJobberman(keyword, location) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const jobbermanUrl = `https://www.jobberman.com/jobs?q=${keyword}&l=${location}`;

    try {
        page.setDefaultNavigationTimeout(0);
        await page.goto(jobbermanUrl);
        const jobs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('[data-cy=listing-cards-components]'), (e) => ({
                title: e.querySelector('[data-cy=listing-title-link]').innerText || 'N/A',
                companyName: e.querySelector('.text-loading-animate-link').innerText || 'N/A',
                companyURL: e.querySelector('.text-loading-animate-link').href || 'N/A',
                jobLocation: e.querySelector('.text-loading-hide').innerText || 'N/A',
                jobDuration: e.querySelector('p .text-loading-animate').innerText || 'N/A',
                jobURL: e.querySelector('[data-cy=listing-title-link]').href || 'N/A',
       }))
        );
        return jobs;
    } catch (error) {
        console.error(error);
        throw new Error('Error scraping Jobberman');
    } finally {
        await browser.close();
    }
}

async function scrapeIndeed(keyword, location) {
    
    const browser = await puppeteer.launch({
        headless: false,
        env: {
          DISPLAY: ':0',
        },
        slowMo: 250,
        args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ],
    });
    const page = await browser.newPage();
    const IndeedUrl = `https://ng.indeed.com/jobs?q=${keyword}&l=${location}`;

    try {
         page.setDefaultNavigationTimeout(0);
        await page.goto(IndeedUrl);
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
        throw new Error('Error scraping Indeed');
    } finally {
        await browser.close();
    }
}

async function scrapeAllPlatforms(keyword, location) {
    try {
        const [linkedInJobs, indeedJobs, jobbermanJobs] = await Promise.all([
            scrapeLinkedIn(keyword, location),
            scrapeIndeed(keyword, location),
            scrapeJobberman(keyword, location)
        ]);
        return [...linkedInJobs, ...indeedJobs, ...jobbermanJobs];
    } catch (error) {
        console.error(error);
        throw new Error('Error scraping all platforms');
    }
}

module.exports = {
    scrapeLinkedIn,
    scrapeJobberman,
    scrapeIndeed,
    scrapeAllPlatforms,
};
