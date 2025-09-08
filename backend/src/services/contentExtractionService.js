const axios = require('axios');
const cheerio = require('cheerio');

class ContentExtractionService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (compatible; FocusCircle/1.0; +https://focuscircle.com/bot)';
    this.timeout = 10000; // 10 seconds
    this.maxContentLength = parseInt(process.env.MAX_CONTENT_LENGTH) || 50000;
  }

  async extractWebsiteMetadata(url) {
    try {
      const response = await this.fetchUrl(url);
      const $ = cheerio.load(response.data);
      
      const metadata = {
        title: this.extractTitle($),
        description: this.extractDescription($),
        favicon: this.extractFavicon($, url),
        language: this.extractLanguage($)
      };

      return metadata;
    } catch (error) {
      console.error('Metadata extraction error:', error);
      return {
        title: 'Unknown',
        description: '',
        favicon: null,
        language: 'en'
      };
    }
  }

  async extractContent(url) {
    try {
      const response = await this.fetchUrl(url);
      const $ = cheerio.load(response.data);
      
      // Remove unwanted elements
      this.removeUnwantedElements($);
      
      const content = {
        title: this.extractTitle($),
        content: this.extractMainContent($),
        metadata: {
          wordCount: 0,
          lastModified: response.headers['last-modified'],
          contentLength: response.data.length
        }
      };

      // Calculate word count
      content.metadata.wordCount = content.content.split(/\s+/).length;
      
      // Truncate if too long
      if (content.content.length > this.maxContentLength) {
        content.content = content.content.substring(0, this.maxContentLength) + '...';
      }

      return {
        success: true,
        ...content
      };
    } catch (error) {
      console.error('Content extraction error:', error);
      return {
        success: false,
        error: error.message,
        title: 'Extraction Failed',
        content: ''
      };
    }
  }

  async testWebsite(url) {
    try {
      const response = await this.fetchUrl(url);
      const $ = cheerio.load(response.data);
      
      const testResults = {
        success: true,
        statusCode: response.status,
        title: this.extractTitle($),
        hasContent: this.hasMainContent($),
        contentLength: response.data.length,
        wordCount: this.extractMainContent($).split(/\s+/).length,
        lastModified: response.headers['last-modified'],
        contentType: response.headers['content-type']
      };

      return testResults;
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status || 0
      };
    }
  }

  async fetchUrl(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        timeout: this.timeout,
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });

      return response;
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        throw new Error('Website not found');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Connection refused');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Request timeout');
      } else if (error.response?.status === 403) {
        throw new Error('Access forbidden');
      } else if (error.response?.status === 404) {
        throw new Error('Page not found');
      } else {
        throw new Error(`HTTP ${error.response?.status || 'Unknown error'}`);
      }
    }
  }

  extractTitle($) {
    // Try multiple selectors for title
    const titleSelectors = [
      'title',
      'h1',
      '.title',
      '.headline',
      '.post-title',
      '.entry-title',
      '[data-testid="title"]'
    ];

    for (const selector of titleSelectors) {
      const title = $(selector).first().text().trim();
      if (title && title.length > 0 && title.length < 200) {
        return title;
      }
    }

    return 'Untitled';
  }

  extractDescription($) {
    // Try multiple selectors for description
    const descSelectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      '.description',
      '.excerpt',
      '.summary'
    ];

    for (const selector of descSelectors) {
      const desc = $(selector).attr('content') || $(selector).text().trim();
      if (desc && desc.length > 0 && desc.length < 500) {
        return desc;
      }
    }

    return '';
  }

  extractFavicon($, baseUrl) {
    // Try multiple favicon sources
    const faviconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]'
    ];

    for (const selector of faviconSelectors) {
      const href = $(selector).attr('href');
      if (href) {
        return this.resolveUrl(href, baseUrl);
      }
    }

    // Fallback to default favicon location
    try {
      const url = new URL(baseUrl);
      return `${url.protocol}//${url.host}/favicon.ico`;
    } catch {
      return null;
    }
  }

  extractLanguage($) {
    const lang = $('html').attr('lang') || 
                 $('meta[http-equiv="content-language"]').attr('content') ||
                 'en';
    return lang.split('-')[0]; // Return just the language code
  }

  extractMainContent($) {
    // Try multiple content selectors
    const contentSelectors = [
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      'main',
      '.main-content',
      '.story-body',
      '.post-body',
      '[data-testid="content"]'
    ];

    let content = '';

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        content = this.cleanText(element.text());
        if (content.length > 100) { // Ensure we have substantial content
          break;
        }
      }
    }

    // Fallback to body if no specific content found
    if (content.length < 100) {
      content = this.cleanText($('body').text());
    }

    return content;
  }

  hasMainContent($) {
    const contentSelectors = [
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      'main'
    ];

    for (const selector of contentSelectors) {
      if ($(selector).length > 0) {
        return true;
      }
    }

    return false;
  }

  removeUnwantedElements($) {
    // Remove unwanted elements that don't contain main content
    const unwantedSelectors = [
      'nav',
      'header',
      'footer',
      '.navigation',
      '.nav',
      '.menu',
      '.sidebar',
      '.advertisement',
      '.ads',
      '.ad',
      '.social',
      '.share',
      '.comments',
      '.comment',
      '.related',
      '.recommended',
      'script',
      'style',
      'noscript',
      '.cookie',
      '.popup',
      '.modal',
      '.overlay'
    ];

    unwantedSelectors.forEach(selector => {
      $(selector).remove();
    });
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
  }

  resolveUrl(href, baseUrl) {
    try {
      return new URL(href, baseUrl).href;
    } catch {
      return href;
    }
  }

  // Utility method to check if URL is accessible
  async isUrlAccessible(url) {
    try {
      const response = await this.fetchUrl(url);
      return {
        accessible: true,
        statusCode: response.status,
        contentType: response.headers['content-type']
      };
    } catch (error) {
      return {
        accessible: false,
        error: error.message,
        statusCode: error.response?.status || 0
      };
    }
  }

  // Method to extract content with custom selectors
  async extractContentWithSelectors(url, selectors) {
    try {
      const response = await this.fetchUrl(url);
      const $ = cheerio.load(response.data);
      
      const extractedData = {};
      
      if (selectors.title) {
        extractedData.title = $(selectors.title).first().text().trim();
      }
      
      if (selectors.content) {
        extractedData.content = this.cleanText($(selectors.content).text());
      }
      
      if (selectors.exclude) {
        selectors.exclude.forEach(selector => {
          $(selector).remove();
        });
      }

      return {
        success: true,
        ...extractedData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new ContentExtractionService();
