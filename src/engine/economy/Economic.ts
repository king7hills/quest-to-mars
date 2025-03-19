import { GameState } from '../state/GameState';
import { Resource, GameResources } from '../state/GameState';
import {
  MarketPrice,
  TradeOffer,
  EconomicAgreement,
  MarketConfig,
  DEFAULT_MARKET_CONFIG,
  TradeStatus,
  EconomicAgreementType,
  AgreementStatus,
  EconomicEffectType,
  EconomicEffect
} from './EconomicTypes';

export class Economic {
  private marketPrices: Map<keyof GameResources, MarketPrice>;
  private tradeOffers: Map<string, TradeOffer>;
  private economicAgreements: Map<string, EconomicAgreement>;
  private config: MarketConfig;
  private gameState: GameState;
  private turnCounter: number;

  constructor(gameState: GameState, config: MarketConfig = DEFAULT_MARKET_CONFIG) {
    this.gameState = gameState;
    this.config = config;
    this.marketPrices = new Map();
    this.tradeOffers = new Map();
    this.economicAgreements = new Map();
    this.turnCounter = 0;
    this.initializeMarket();
  }

  private initializeMarket(): void {
    Object.entries(this.config.basePrices).forEach(([resource, basePrice]) => {
      const resourceKey = resource as 'food' | 'wood' | 'stone' | 'gold' | 'metal' | 'fuel' | 'techPoints';
      const volatility = this.config.volatility[resourceKey] || 0.1; // Use default volatility if undefined
      this.marketPrices.set(resourceKey, {
        resource: resourceKey,
        basePrice,
        currentPrice: basePrice,
        volatility,
        demand: 1,
        supply: 1
      });
    });
  }

  public update(): void {
    this.turnCounter++;
    
    // Update market prices based on interval
    if (this.turnCounter % this.config.priceUpdateInterval === 0) {
      this.updateMarketPrices();
    }

    // Update trade offers
    this.updateTradeOffers();

    // Update economic agreements
    this.updateEconomicAgreements();
  }

  private updateMarketPrices(): void {
    this.marketPrices.forEach((price) => {
      // Calculate price fluctuation
      const volatilityFactor = (Math.random() - 0.5) * 2 * price.volatility;
      
      // Get epoch multiplier
      const epochMultiplier = this.config.epochMultipliers[this.gameState.getEpoch()];
      
      // Update price based on supply and demand
      const supplyDemandFactor = price.demand / price.supply;
      const newPrice = price.basePrice * epochMultiplier * (1 + volatilityFactor) * supplyDemandFactor;
      
      // Apply price constraints
      price.currentPrice = Math.max(
        price.basePrice * this.config.minPriceMultiplier,
        Math.min(newPrice, price.basePrice * this.config.maxPriceMultiplier)
      );
    });
  }

  private updateTradeOffers(): void {
    this.tradeOffers.forEach((offer) => {
      // Update existing trades
      if (offer.status === TradeStatus.ACCEPTED) {
        offer.turnsRemaining--;
        if (offer.turnsRemaining <= 0) {
          this.completeTrade(offer);
        }
      }
    });
  }

  private updateEconomicAgreements(): void {
    this.economicAgreements.forEach((agreement, id) => {
      if (agreement.status === AgreementStatus.ACTIVE) {
        agreement.duration--;
        if (agreement.duration <= 0) {
          this.endAgreement(id);
        }
      }
    });
  }

  public createTradeOffer(
    sellerId: string,
    buyerId: string,
    resource: keyof GameResources,
    amount: number,
    pricePerUnit: number
  ): TradeOffer {
    const offer: TradeOffer = {
      id: `trade_${Date.now()}`,
      sellerId,
      buyerId,
      resource,
      amount,
      pricePerUnit,
      totalPrice: amount * pricePerUnit,
      status: TradeStatus.PENDING,
      turnsRemaining: 5
    };

    this.tradeOffers.set(offer.id, offer);
    return offer;
  }

  public acceptTradeOffer(offerId: string): boolean {
    const offer = this.tradeOffers.get(offerId);
    if (!offer || offer.status !== TradeStatus.PENDING) {
      return false;
    }

    offer.status = TradeStatus.ACCEPTED;
    return true;
  }

  public rejectTradeOffer(offerId: string): boolean {
    const offer = this.tradeOffers.get(offerId);
    if (!offer || offer.status !== TradeStatus.PENDING) {
      return false;
    }

    offer.status = TradeStatus.REJECTED;
    return true;
  }

  private completeTrade(offer: TradeOffer): void {
    // Get seller and buyer
    const seller = this.gameState.getPlayer(offer.sellerId);
    const buyer = this.gameState.getPlayer(offer.buyerId);
    
    if (!seller || !buyer) return;
    
    const resourceKey = offer.resource;
    const sellerResource = seller.resources[resourceKey];
    const buyerResource = buyer.resources[resourceKey];
    
    if (!sellerResource || !buyerResource) return;
    
    // Transfer resources if seller has enough
    const typedSellerResource = sellerResource as Resource;
    const typedBuyerResource = buyerResource as Resource;
    
    if (typedSellerResource.amount >= offer.amount) {
      // Transfer the resource
      typedSellerResource.amount -= offer.amount;
      typedBuyerResource.amount += offer.amount;
      
      // Transfer gold (payment)
      const sellerGold = seller.resources.gold;
      const buyerGold = buyer.resources.gold;
      
      if (sellerGold && buyerGold) {
        const typedSellerGold = sellerGold as Resource;
        const typedBuyerGold = buyerGold as Resource;
        
        const actualCost = offer.amount * offer.pricePerUnit;
        if (typedBuyerGold.amount >= actualCost) {
          typedBuyerGold.amount -= actualCost;
          typedSellerGold.amount += actualCost;
          
          // Update offer status
          offer.status = TradeStatus.COMPLETED;
          
          // Update market supply and demand
          this.updateResourceSupply(offer.resource, typedSellerResource.amount);
          this.updateResourceDemand(offer.resource, typedBuyerResource.amount);
        }
      }
    } else {
      // Mark as rejected if seller doesn't have enough
      offer.status = TradeStatus.REJECTED;
    }
  }

  public createEconomicAgreement(
    type: EconomicAgreementType,
    participants: string[],
    resources: {
      [key: string]: {
        [key in keyof Resource]?: number;
      };
    },
    duration: number,
    effects: EconomicEffect[]
  ): EconomicAgreement {
    const agreement: EconomicAgreement = {
      id: `agreement_${Date.now()}`,
      type,
      participants,
      resources,
      duration,
      effects,
      status: AgreementStatus.PENDING
    };

    this.economicAgreements.set(agreement.id, agreement);
    return agreement;
  }

  public acceptAgreement(agreementId: string): boolean {
    const agreement = this.economicAgreements.get(agreementId);
    if (!agreement || agreement.status !== AgreementStatus.PENDING) {
      return false;
    }

    agreement.status = AgreementStatus.ACTIVE;
    this.applyAgreementEffects(agreement);
    return true;
  }

  public rejectAgreement(agreementId: string): boolean {
    const agreement = this.economicAgreements.get(agreementId);
    if (!agreement || agreement.status !== AgreementStatus.PENDING) {
      return false;
    }

    agreement.status = AgreementStatus.REJECTED;
    return true;
  }

  private endAgreement(agreementId: string): void {
    const agreement = this.economicAgreements.get(agreementId);
    if (!agreement) return;

    // Remove agreement effects
    this.removeAgreementEffects(agreement);
    agreement.status = AgreementStatus.COMPLETED;
  }

  private applyAgreementEffects(agreement: EconomicAgreement): void {
    agreement.effects.forEach(effect => {
      switch (effect.type) {
        case EconomicEffectType.TRADE_DISCOUNT:
          // Apply trade discount to participants
          break;
        case EconomicEffectType.PRODUCTION_BOOST:
          // Apply production boost to participants
          break;
        case EconomicEffectType.MARKET_ACCESS:
          // Grant market access between participants
          break;
        case EconomicEffectType.RESOURCE_SHARING:
          // Enable resource sharing between participants
          break;
      }
    });
  }

  private removeAgreementEffects(agreement: EconomicAgreement): void {
    agreement.effects.forEach(effect => {
      switch (effect.type) {
        case EconomicEffectType.TRADE_DISCOUNT:
          // Remove trade discount from participants
          break;
        case EconomicEffectType.PRODUCTION_BOOST:
          // Remove production boost from participants
          break;
        case EconomicEffectType.MARKET_ACCESS:
          // Remove market access between participants
          break;
        case EconomicEffectType.RESOURCE_SHARING:
          // Remove resource sharing between participants
          break;
      }
    });
  }

  public getMarketPrice(resource: keyof GameResources): number {
    return this.marketPrices.get(resource)?.currentPrice || 0;
  }

  public getActiveTradeOffers(): TradeOffer[] {
    return Array.from(this.tradeOffers.values())
      .filter(offer => offer.status === TradeStatus.PENDING);
  }

  public getActiveAgreements(): EconomicAgreement[] {
    return Array.from(this.economicAgreements.values())
      .filter(agreement => agreement.status === AgreementStatus.ACTIVE);
  }

  public getPendingAgreements(): EconomicAgreement[] {
    return Array.from(this.economicAgreements.values())
      .filter(agreement => agreement.status === AgreementStatus.PENDING);
  }

  public updateResourceDemand(resource: keyof GameResources, demand: number): void {
    const price = this.marketPrices.get(resource);
    if (price) {
      price.demand = demand;
    }
  }

  public updateResourceSupply(resource: keyof GameResources, supply: number): void {
    const price = this.marketPrices.get(resource);
    if (price) {
      price.supply = supply;
    }
  }

  public reset(): void {
    this.marketPrices.clear();
    this.tradeOffers.clear();
    this.economicAgreements.clear();
    this.initializeMarket();
  }
  
  public serialize(): any {
    return {
      marketPrices: Array.from(this.marketPrices.entries()),
      tradeOffers: Array.from(this.tradeOffers.entries()),
      agreements: Array.from(this.economicAgreements.entries())
    };
  }
  
  public deserialize(data: any): void {
    if (!data) return;
    
    // Restore market prices
    if (data.marketPrices && Array.isArray(data.marketPrices)) {
      this.marketPrices.clear();
      data.marketPrices.forEach(([resourceKey, value]: [string, MarketPrice]) => {
        // Convert the string key to keyof GameResources type
        const typedKey = resourceKey as keyof GameResources;
        this.marketPrices.set(typedKey, value);
      });
    }
    
    this.tradeOffers.clear();
    if (data.tradeOffers) {
      data.tradeOffers.forEach(([key, value]: [string, any]) => {
        this.tradeOffers.set(key, value);
      });
    }
    
    this.economicAgreements.clear();
    if (data.agreements) {
      data.agreements.forEach(([key, value]: [string, any]) => {
        this.economicAgreements.set(key, value);
      });
    }
  }
} 