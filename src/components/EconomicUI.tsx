import React, { useState } from 'react';
import { GameState, GameResourcesWithGold } from '../engine/state/GameState';
import { Economic } from '../engine/economy/Economic';

interface EconomicUIProps {
  gameState: GameState;
  economic: Economic;
}

export const EconomicUI: React.FC<EconomicUIProps> = ({ gameState, economic }) => {
  const [selectedTab, setSelectedTab] = useState<'market' | 'trades' | 'agreements'>('market');
  const [selectedResource, setSelectedResource] = useState<keyof GameResourcesWithGold | null>(null);
  const [tradeAmount, setTradeAmount] = useState<number>(0);
  const [tradePrice, setTradePrice] = useState<number>(0);

  const resources = gameState.getResources();
  const activeTradeOffers = economic.getActiveTradeOffers();
  const activeAgreements = economic.getActiveAgreements();

  const handleCreateTradeOffer = (resource: keyof GameResourcesWithGold) => {
    if (tradeAmount <= 0 || tradePrice <= 0) return;
    
    // TODO: Replace with actual player ID
    const playerId = 'player1';
    economic.createTradeOffer(playerId, 'ai1', resource, tradeAmount, tradePrice);
    
    // Reset form
    setTradeAmount(0);
    setTradePrice(0);
  };

  const handleAcceptTrade = (offerId: string) => {
    economic.acceptTradeOffer(offerId);
  };

  const handleRejectTrade = (offerId: string) => {
    economic.rejectTradeOffer(offerId);
  };

  const renderMarketTab = () => (
    <div className="market-tab">
      <h3>Market Prices</h3>
      <div className="market-prices">
        {Object.entries(resources).map(([resource, data]) => (
          <div key={resource} className="market-price-item">
            <span className="resource-name">{resource}</span>
            <span className="price">
              {economic.getMarketPrice(resource as keyof GameResourcesWithGold).toFixed(2)}
            </span>
            <span className="amount">
              {data.amount}
            </span>
          </div>
        ))}
      </div>

      <h3>Create Trade Offer</h3>
      <div className="trade-form">
        <select
          value={selectedResource || ''}
          onChange={(e) => setSelectedResource(e.target.value as keyof GameResourcesWithGold)}
        >
          <option value="">Select Resource</option>
          {Object.keys(resources).map((resource) => (
            <option key={resource} value={resource}>
              {resource}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={tradeAmount}
          onChange={(e) => setTradeAmount(Number(e.target.value))}
        />

        <input
          type="number"
          placeholder="Price per unit"
          value={tradePrice}
          onChange={(e) => setTradePrice(Number(e.target.value))}
        />

        <button
          onClick={() => selectedResource && handleCreateTradeOffer(selectedResource)}
          disabled={!selectedResource || tradeAmount <= 0 || tradePrice <= 0}
        >
          Create Offer
        </button>
      </div>
    </div>
  );

  const renderTradesTab = () => (
    <div className="trades-tab">
      <h3>Active Trade Offers</h3>
      <div className="trade-offers">
        {activeTradeOffers.map((offer) => (
          <div key={offer.id} className="trade-offer">
            <div className="offer-details">
              <span className="resource">{String(offer.resource)}</span>
              <span className="amount">{offer.amount}</span>
              <span className="price">{offer.pricePerUnit}</span>
              <span className="total">{offer.totalPrice}</span>
            </div>
            <div className="offer-actions">
              <button onClick={() => handleAcceptTrade(offer.id)}>
                Accept
              </button>
              <button onClick={() => handleRejectTrade(offer.id)}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAgreementsTab = () => (
    <div className="agreements-tab">
      <h3>Active Agreements</h3>
      <div className="agreements">
        {activeAgreements.map((agreement) => (
          <div key={agreement.id} className="agreement">
            <div className="agreement-type">{agreement.type}</div>
            <div className="agreement-duration">
              Duration: {agreement.duration} turns
            </div>
            <div className="agreement-effects">
              {agreement.effects.map((effect, index) => (
                <div key={index} className="effect">
                  {effect.description}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h3>Pending Agreements</h3>
      <div className="agreements">
        {economic.getPendingAgreements().map((agreement) => (
          <div key={agreement.id} className="agreement">
            <div className="agreement-type">{agreement.type}</div>
            <div className="agreement-duration">
              Duration: {agreement.duration} turns
            </div>
            <div className="agreement-effects">
              {agreement.effects.map((effect, index) => (
                <div key={index} className="effect">
                  {effect.description}
                </div>
              ))}
            </div>
            <div className="offer-actions">
              <button onClick={() => economic.acceptAgreement(agreement.id)}>
                Accept
              </button>
              <button onClick={() => economic.rejectAgreement(agreement.id)}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="economic-ui">
      <div className="tabs">
        <button
          className={selectedTab === 'market' ? 'active' : ''}
          onClick={() => setSelectedTab('market')}
        >
          Market
        </button>
        <button
          className={selectedTab === 'trades' ? 'active' : ''}
          onClick={() => setSelectedTab('trades')}
        >
          Trades
        </button>
        <button
          className={selectedTab === 'agreements' ? 'active' : ''}
          onClick={() => setSelectedTab('agreements')}
        >
          Agreements
        </button>
      </div>

      <div className="content">
        {selectedTab === 'market' && renderMarketTab()}
        {selectedTab === 'trades' && renderTradesTab()}
        {selectedTab === 'agreements' && renderAgreementsTab()}
      </div>

      <style>{`
        .economic-ui {
          background: rgba(0, 0, 0, 0.8);
          border-radius: 8px;
          padding: 16px;
          color: white;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .tabs button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
        }

        .tabs button.active {
          background: rgba(255, 255, 255, 0.2);
        }

        .market-prices {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .market-price-item {
          background: rgba(255, 255, 255, 0.1);
          padding: 12px;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .trade-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 300px;
        }

        .trade-form input,
        .trade-form select {
          padding: 8px;
          border-radius: 4px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .trade-form button {
          padding: 8px;
          border: none;
          border-radius: 4px;
          background: #4CAF50;
          color: white;
          cursor: pointer;
        }

        .trade-form button:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .trade-offers,
        .agreements {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .trade-offer,
        .agreement {
          background: rgba(255, 255, 255, 0.1);
          padding: 12px;
          border-radius: 4px;
        }

        .offer-details {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }

        .offer-actions {
          display: flex;
          gap: 8px;
        }

        .offer-actions button {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          background: #4CAF50;
          color: white;
          cursor: pointer;
        }

        .agreement-type {
          font-weight: bold;
          margin-bottom: 8px;
        }

        .agreement-duration {
          color: #aaa;
          margin-bottom: 8px;
        }

        .agreement-effects {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .effect {
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}; 