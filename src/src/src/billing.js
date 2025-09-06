import { Actor } from 'apify';

export class PayPerEventHandler {
    constructor() {
        this.events = [];
        this.totalCost = 0;
    }

    async chargeEvent(eventType, cost) {
        // Log event for billing
        this.events.push({
            type: eventType,
            cost: cost,
            timestamp: new Date().toISOString()
        });
        
        this.totalCost += cost;
        
        // Use Apify's pay-per-event API
        await Actor.call('apify/billing-event', {
            eventType: eventType,
            cost: cost
        });
        
        console.log(`Charged $${cost} for ${eventType}`);
    }

    getBillingReport() {
        return {
            events: this.events,
            totalCost: this.totalCost
        };
    }
}
