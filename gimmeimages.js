import puppeteer from 'puppeteer';
import fs from 'fs';

const MEETUP_USERNAME = process.env.MEETUP_USERNAME;
const MEETUP_PASSWORD = process.env.MEETUP_PASSWORD;

// Launch the browser and open a new blank page
const browser = await puppeteer.launch({headless: false});
const page = await browser.newPage();
await page.setRequestInterception(true);

// Cancel any image downloads to help speed things up a little
page.on('request', request => {
  if (request.resourceType() === 'image') {
    request.abort();
  } else {
    request.continue();
  }
});

// Set screen size.
await page.setViewport({width: 1080, height: 1024});  

// Navigate the page to a URL.
await page.goto('https://www.meetup.com/login');



// fill in the login form

console.log("Logging in");

// data-testid="email"
await page.locator('input[data-testid="email"]').fill(MEETUP_USERNAME);
// data-testid="current-password"
await page.locator('input[data-testid="current-password"]').fill(MEETUP_PASSWORD);
// data-testid="submit"
await page.locator('button[data-testid="submit"]').click();

await page.waitForNavigation();

console.log("Login successful");
console.log("Navigating to photos page");
await page.goto('https://www.meetup.com/sydcss/photos');

// wait for the new ones to load
await page.waitForSelector('#submain a');

console.log("Scrolling to the bottom of this page to load all albums");
// scroll to the bottom...
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
});

console.log("Waiting for additional albums to load");
// wait for the new ones to load
await page.waitForSelector('#submain a:nth-child(44)');
const links = await page.$$('#submain a');
const albumNames = await page.$$('#submain a .font-medium')

const albumIndex = process.argv[2] || 0;
let fileName = albumIndex + '-';

// Click on the first <a> element if it exists
if (links.length > 0) {
    fileName += await page.evaluate(el => el.textContent, albumNames[albumIndex])

    console.log("Clicking on album " + albumIndex + " AKA " + fileName);

    await links[albumIndex].click();
} else {
    console.log('No matching elements found.');
}


console.log("Waiting for images to load");
await page.waitForSelector('#submain li a');
// see if there are images...
const images = await page.$$('#submain li a');

// Click on the first <a> element if it exists
const imageUrls = [];
let count = 0;
if (images.length > 0) {
    for (const image of images) {
        count++;
        console.log("Clicking on image " + count);
        await image.click();
        await page.waitForSelector('#download-photo');
        let download = await page.$$('#download-photo');
        let pageTarget = page.target();
        download[0].click();
        const newTarget = await browser.waitForTarget(target => target.opener() === pageTarget);
        const newPage = await newTarget.page();
        imageUrls.push(newPage.url());
        newPage.close();
        await page.waitForSelector('#close-overlay');
        await page.locator('#close-overlay').click();
    }
} else {
    console.log('No matching images found.');
}

fileName = fileName.replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+$/, '');

console.log(fileName);
console.log(imageUrls);

const content = 'Some content!';
fs.writeFile('./exports/' + fileName + '.json', JSON.stringify(imageUrls), err => {
  if (err) {
    console.error(err);
  } else {
    console.log('Export file created');
  }
});

await browser.close();