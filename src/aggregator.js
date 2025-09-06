import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';

export class BusinessIntelligenceAggregator {
    constructor() {
        this.results = {
            company: {},
            sentiment: {},
            jobMarket: {},
            competitive: {},
            timestamp: new Date().toISOString()
        };
    }

    async processTarget(input) {
        const { targetCompany, analysisDepth, includeSentiment, includeJobPostings } = input;
        
        console.log(`Starting BI analysis for: ${targetCompany}`);
        
        // Company basic info
        this.results.company = await this.scrapeCompanyBasics(targetCompany);
        
        if (includeSentiment) {
            this.results.sentiment = await this.analyzeSentiment(targetCompany);
        }
        
        if (includeJobPostings) {
            this.results.jobMarket = await this.analyzeJobMarket(targetCompany);
        }
        
        // Generate AI insights
        this.results.aiInsights = await this.generateInsights();
        
        return this.results;
    }

    async scrapeCompanyBasics(company) {
        // LinkedIn company page scraping
        const linkedinData = await this.scrapeLinkedInCompany(company);
        return {
            name: company,
            employees: linkedinData.employeeCount,
            industry: linkedinData.industry,
            headquarters: linkedinData.location,
            description: linkedinData.description
        };
    }

    async scrapeLinkedInCompany(company) {
        const crawler = new PlaywrightCrawler({
            requestHandler: async ({ page, request }) => {
                // Navigate to LinkedIn company search
                await page.goto(`https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`);
                
                // Extract company data
                const companyData = await page.evaluate(() => {
                    const firstResult = document.querySelector('[data-test-id="search-result"]');
                    if (!firstResult) return {};
                    
                    return {
                        name: firstResult.querySelector('h3')?.textContent?.trim(),
                        industry: firstResult.querySelector('.company-industries')?.textContent?.trim(),
                        employeeCount: firstResult.querySelector('.company-employees')?.textContent?.trim(),
                        location: firstResult.querySelector('.company-location')?.textContent?.trim()
                    };
                });
                
                return companyData;
            }
        });
        
        await crawler.run([`https://linkedin.com/search/companies?keywords=${company}`]);
        return crawler.getData();
    }
}
