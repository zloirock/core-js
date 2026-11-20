import { readFile } from 'node:fs/promises';
import { basicAuthorization, closeSession } from './webdriver.mjs';

const { SAUCE_USERNAME, SAUCE_ACCESS_KEY, SAUCE_SESSIONS_FILE } = process.env;
const authorization = basicAuthorization(SAUCE_USERNAME, SAUCE_ACCESS_KEY);
const ids = await readFile(SAUCE_SESSIONS_FILE, 'utf8');

await Promise.all(ids.split('\n').filter(Boolean).map(async id => {
  try {
    await closeSession('https://ondemand.us-west-1.saucelabs.com/wd/hub', authorization, id, 30e3);
  } catch (error) {
    console.error(error.message);
  }
}));
