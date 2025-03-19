import { GameResources, Resource } from '../state/ResourceTypes';
import { Epoch } from '../state/GameTypes';

export interface MarketPrice {
  resource: keyof GameResources;
  basePrice: number;
  currentPrice: number;
  volatility: number;
  demand: number;
  supply: number;
}

export interface TradeOffer {
  id: string;
  sellerId: string;
  buyerId: string;
  resource: keyof GameResources;
  amount: number;
  pricePerUnit: number;
  totalPrice: number;
  status: TradeStatus;
  turnsRemaining: number;
}

export interface EconomicAgreement {
  id: string;
  type: EconomicAgreementType;
  participants: string[];
  resources: {
    [key: string]: {
      [key in keyof Resource]?: number;
    };
  };
  duration: number;
  effects: EconomicEffect[];
  status: AgreementStatus;
}

export interface EconomicEffect {
  type: EconomicEffectType;
  value: number;
  description: string;
}

export enum TradeStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum EconomicAgreementType {
  TRADE_DEAL = 'TRADE_DEAL',
  RESOURCE_SHARING = 'RESOURCE_SHARING',
  JOINT_PRODUCTION = 'JOINT_PRODUCTION',
  MARKET_ACCESS = 'MARKET_ACCESS'
}

export enum AgreementStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

export enum EconomicEffectType {
  TRADE_DISCOUNT = 'TRADE_DISCOUNT',
  PRODUCTION_BOOST = 'PRODUCTION_BOOST',
  MARKET_ACCESS = 'MARKET_ACCESS',
  RESOURCE_SHARING = 'RESOURCE_SHARING'
}

export interface MarketConfig {
  basePrices: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    metal: number;
    fuel: number;
    techPoints: number;
  };
  volatility: {
    food: number;
    wood: number;
    stone: number;
    gold: number;
    metal: number;
    fuel: number;
    techPoints: number;
  };
  epochMultipliers: {
    [key in Epoch]: number;
  };
  maxPriceMultiplier: number;
  minPriceMultiplier: number;
  priceUpdateInterval: number;
}

export const DEFAULT_MARKET_CONFIG: MarketConfig = {
  basePrices: {
    food: 1,
    wood: 2,
    stone: 3,
    gold: 5,
    metal: 4,
    fuel: 6,
    techPoints: 10
  },
  volatility: {
    food: 0.1,
    wood: 0.15,
    stone: 0.2,
    gold: 0.3,
    metal: 0.25,
    fuel: 0.35,
    techPoints: 0.4
  },
  epochMultipliers: {
    [Epoch.TRIBAL]: 1.0,
    [Epoch.AGRICULTURAL]: 1.2,
    [Epoch.INDUSTRIAL]: 1.5,
    [Epoch.SPACE_AGE]: 2.0
  },
  maxPriceMultiplier: 3.0,
  minPriceMultiplier: 0.3,
  priceUpdateInterval: 5
}; 