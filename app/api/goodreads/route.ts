import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractProfileString } from '@/lib/utils'
import { GoodreadsBook } from '@/types'

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry failed requests
async function fetchWithRetry(url: string, maxRetries = 3, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
        },
        timeout: 10000
      });

      // If we get a response but no books, wait and retry
      const $ = cheerio.load(response.data);
      const booksCount = $('#booksBody tr.bookalike').length;
      
      if (booksCount === 0 && attempt < maxRetries) {
        console.log(`Attempt ${attempt}: No books found, waiting ${delayMs}ms before retry...`);
        await delay(delayMs);
        continue;
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
  throw new Error('All retry attempts failed');
}



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inputUrl = searchParams.get('url') || ''
    const profileString = extractProfileString(inputUrl)
    const baseUrl = `https://www.goodreads.com/review/list/${profileString}?&per_page=10&shelf=read&utf8=%E2%9C%93`;
    const books: GoodreadsBook[] = [];
    const maxPages = 5;

    for (let page = 1; page <= maxPages; page++) {
      const url = `${baseUrl}&page=${page}`;
      console.log(`Fetching page ${page}...`);

      try {
        const response = await fetchWithRetry(url);
        const $ = cheerio.load(response.data);
        
        // First wait a bit to ensure content is loaded
        //await delay(0.01);

        const booksContainer = $('#booksBody');
        const booksOnPage = booksContainer.find('tr.bookalike');

        if (booksOnPage.length === 0) {
          console.log(`No more books found on page ${page}, stopping pagination`);
          break;
        }

        booksOnPage.each((_, element) => {
          const title = $(element).find('td.title div.value a').attr('title')?.trim() || 'No title';
          const avgRating = $(element).find('td.avg_rating div.value').text().trim() || 'No rating';
          //const userRating = $(element).find('.stars').html() || 'No rating';
          //const userReview = $(element).find('td.review div.value').text().trim() || 'No review';
          const cover = $(element).find('td.cover div.value img').attr('src')?.trim() || 'No title'
          const dateRead =$(element).find('td.date_read div.value .date_read_value').text().trim() || 'No date';

          books.push({
            title,
            avgRating,
            cover,
            dateRead
          });
        });

        console.log(`Found ${booksOnPage.length} books on page ${page}`);
        
        // Add a delay before fetching the next page
        //await delay(0.01);

      } catch (error: any) {
        console.error(`Error fetching page ${page}:`, error.message);
        break;
      }
    }

    if (books.length === 0) {
      console.log('No books found across all pages');
      return NextResponse.json({ error: 'No books found' }, { status: 404 });
    }

    console.log(`Successfully scraped ${books.length} books total`);
    return NextResponse.json(books);

  } catch (error: any) {
    console.error('Scraping error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

/*import { NextRequest, NextResponse } from 'next/server'; 

import axios from 'axios'

import * as cheerio from 'cheerio';


export async function GET(request: NextRequest) {
  try {
    //const { searchParams } = new URL(request.url); //const url = searchParams.get('url');
    const goodreadsRSSFeedUrl = 'https://www.goodreads.com/review/list/130048134-kyra-ezikeuzor?utf8=%E2%9C%93&shelf=read&utf8=%E2%9C%93&title=kyra-ezikeuzor&per_page=infinite';

    if (goodreadsRSSFeedUrl) {
      try {
        let response = await axios.get(goodreadsRSSFeedUrl)
        const $ = cheerio.load(response.data);
        const books: Array<{ title: string; avgRating: string, userRating: string, userReview: string }> = [];
        
        const booksContainer = $('#booksBody');
        const num = booksContainer.find('tr.bookalike').length

        // If we found the container, search within it
        if (booksContainer.length) {
          booksContainer.find('tr.bookalike').each((_, element) => {
            const title = $(element).find('td.title div.value a').attr('title')?.trim() || 'No title';
            const avgRating = $(element).find('td.avg_rating div.value').text().trim() || '0';
            const userRating = $(element).find('.stars').attr('data-rating')?.trim() || '99';
            const userReview = booksContainer.find('tr.bookalike').length.toString() //$(element).find('td.review div.value a').text().trim() || '99';

            books.push({ 
              title, 
              avgRating,
              userRating,
              userReview
            });
          });
        }

          return NextResponse.json(books);
        } catch (error:any) {
          console.error(`Error fetching the Goodreads RSS feed: ${error.message}`)
        }

    } else {
      console.log('📚 No Goodreads RSS feed found.')
    }
  
  } catch (error) {
    console.error('Scraping error:', error);
    return Response.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

*/