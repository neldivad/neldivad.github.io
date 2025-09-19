import React, { useState, useEffect, useRef, useMemo } from 'react';

interface PokerHand {
  hand: string[];
  count: number;
  wins: number;
  ties: number;
  handChances: Array<{
    name: string;
    count: number;
  }>;
  favourite: boolean;
}

interface PokerOddsCalculatorProps {
  className?: string;
}

const PokerOddsCalculator: React.FC<PokerOddsCalculatorProps> = ({ className = '' }) => {
  const [hands, setHands] = useState<string[][]>([['', ''], ['', '']]);
  const [board, setBoard] = useState<string[]>(['', '', '', '', '']);
  const [iterations, setIterations] = useState<number>(1000);
  const [results, setResults] = useState<PokerHand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [useActualProbabilities, setUseActualProbabilities] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const usedCards = useMemo(() => new Set<string>([...hands.flat(), ...board].filter(Boolean)), [hands, board]);

  const suits = ['s', 'h', 'd', 'c']; // spades, hearts, diamonds, clubs
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  // Generate full deck
  const fullDeck: string[] = [];
  ranks.forEach(rank => {
    suits.forEach(suit => {
      fullDeck.push(rank + suit);
    });
  });

  // Card display mapping
  const cardDisplayMap: { [key: string]: string } = {
    's': '♠', 'h': '♥', 'd': '♦', 'c': '♣'
  };

  const getCardDisplay = (card: string): string => {
    if (!card || card.length < 2) return card;
    const rank = card[0];
    const suit = card[1];
    return rank + cardDisplayMap[suit];
  };

  const handTypeAbbr = {
    'high card': 'High',
    'one pair': '1P',
    'two pair': '2P',
    'three of a kind': '3oK',
    'straight': 'Straight',
    'flush': 'Flush',
    'full house': 'FH',
    'four of a kind': '4oK',
    'straight flush': 'SF',
    'royal flush': 'RF'
  };

  const validateCard = (card: string): boolean => {
    if (!card || card.length !== 2) return false;
    const rank = card[0].toUpperCase();
    const suit = card[1].toLowerCase();
    return ranks.includes(rank) && suits.includes(suit);
  };

  const checkCardCollision = (): string[] => {
    const allCards = [...hands.flat(), ...board].filter(card => card);
    const duplicates: string[] = [];
    const seen = new Set<string>();
    
    allCards.forEach(card => {
      if (seen.has(card)) {
        duplicates.push(card);
      } else {
        seen.add(card);
      }
    });
    
    return duplicates;
  };

  const randomizeHands = () => {
    const shuffled = [...fullDeck].sort(() => Math.random() - 0.5);
    const newHands: string[][] = [];
    const newBoard: string[] = ['', '', '', '', ''];
    let cardIndex = 0;

    // Deal hands
    for (let i = 0; i < numPlayers; i++) {
      newHands.push([shuffled[cardIndex], shuffled[cardIndex + 1]]);
      cardIndex += 2;
    }

    // Deal board randomly: 50/50 preflop (0) or flop (3)
    const dealCount = Math.random() < 0.5 ? 0 : 3;
    for (let i = 0; i < dealCount; i++) {
      newBoard[i] = shuffled[cardIndex];
      cardIndex++;
    }

    setHands(newHands);
    setBoard(newBoard);
    setResults([]);
    setError('');
  };

  const updateNumPlayers = (newNum: number) => {
    setNumPlayers(newNum);
    const newHands: string[][] = [];
    for (let i = 0; i < newNum; i++) {
      if (hands[i]) {
        newHands.push(hands[i]);
      } else {
        newHands.push(['', '']);
      }
    }
    setHands(newHands);
  };

  const updateHand = (handIndex: number, cardIndex: number, value: string) => {
    const newHands = [...hands];
    newHands[handIndex][cardIndex] = value;
    setHands(newHands);
  };

  const updateBoard = (index: number, value: string) => {
    const newBoard = [...board];
    newBoard[index] = value;
    setBoard(newBoard);
  };

  const clearAll = () => {
    setHands(Array.from({ length: numPlayers }, () => ['', '']));
    setBoard(['', '', '', '', '']);
    setResults([]);
    setError('');
  };

  const calculateOdds = async () => {
    setLoading(true);
    setError('');

    try {
      // Check for card collisions
      const duplicates = checkCardCollision();
      if (duplicates.length > 0) {
        setError(`Duplicate cards detected: ${duplicates.join(', ')}`);
        setLoading(false);
        return;
      }

      // Validate hands
      const validHands = hands.filter(hand => 
        hand.length === 2 && 
        hand.every(card => validateCard(card)) &&
        hand[0] && hand[1]
      );

      if (validHands.length < 2) {
        setError('Please enter at least 2 valid hands (2 cards each)');
        setLoading(false);
        return;
      }

      // Validate board cards
      const validBoard = board.filter(card => validateCard(card));

      // Use official poker-odds library only; surface errors explicitly
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod: any = require('poker-odds');
      if (!mod || typeof mod.calculateEquity !== 'function') {
        throw new Error('poker-odds not available: calculateEquity missing');
      }
      const eqResults = mod.calculateEquity(validHands, validBoard, iterations, false);
      setResults(eqResults);

    } catch (err) {
      setError('Error calculating odds: [' + (err as Error).message + "] Retry with lower iterations.");
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (wins: number, ties: number, total: number): string => {
    const winPct = ((wins / total) * 100).toFixed(1);
    const tiePct = ((ties / total) * 100).toFixed(1);
    return `${winPct}% (${tiePct}% tie)`;
  };

  const computeWinRateColor = (winRate: number, min: number, max: number): string => {
    const clampedMin = Math.max(0, Math.min(100, min));
    const clampedMax = Math.max(clampedMin, Math.min(100, max));
    const t = clampedMax > clampedMin ? (winRate - clampedMin) / (clampedMax - clampedMin) : 0.5;
    const hue = 0 + (120 * Math.max(0, Math.min(1, t))); // 0=red, 120=green
    return `hsl(${hue}, 70%, 45%)`;
  };

  // Create horizontal bar chart for results
  useEffect(() => {
    if (results.length > 0 && chartRef.current) {
      // compute global max base and global max actual for scaling
      const barsHTML = results.map((result, index) => {
        const winRate = (result.wins / result.count) * 100;
        const bases = result.handChances.map(ch => (ch.count / result.count) * 100);
        const actuals = bases.map(b => (useActualProbabilities ? (b * winRate / 100) : b));
        const allActualMax = Math.max(...results.flatMap(r => {
          const wr = (r.wins / r.count) * 100;
          return r.handChances.map(ch => {
            const b = (ch.count / r.count) * 100;
            return b * wr / 100;
          });
        }), 0.0001);
        const denomGlobal = useActualProbabilities ? allActualMax : 100;

        return `
          <div style="margin-bottom: 15px;">
            <h4 style="color: var(--ifm-color-primary); margin-bottom: 10px;">
              Hand ${index + 1}: ${result.hand.map(card => getCardDisplay(card)).join(' ')}
            </h4>
            <div style="display: flex; flex-direction: column; gap: 5px;">
              ${result.handChances.map((chance, i) => {
                const basePercentage = bases[i];
                const actualPercentage = actuals[i];
                const denom = denomGlobal || 100;
                const widthPct = Math.min(100, (actualPercentage / denom) * 100);
                return `
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="min-width: 60px; font-size: 12px;">${handTypeAbbr[chance.name as keyof typeof handTypeAbbr]}</span>
                    <div 
                      style="flex: 1; height: 20px; background: var(--ifm-color-emphasis-300); border-radius: 10px; overflow: hidden; position: relative; transition: background-color 0.2s;"
                      title="Base: ${basePercentage.toFixed(1)}% | ${useActualProbabilities ? `Actual: ${actualPercentage.toFixed(1)}% | ` : ''}Scaled to global ${useActualProbabilities ? 'actual' : 'base'} max (${denom.toFixed(1)}%)"
                      onmouseover="this.style.backgroundColor='var(--ifm-color-emphasis-400)'"
                      onmouseout="this.style.backgroundColor='var(--ifm-color-emphasis-300)'"
                    >
                      <div 
                        style="height: 100%; width: ${widthPct}%; background: var(--ifm-color-primary); transition: width 0.3s;"
                      ></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');

      const chartHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          ${barsHTML}
        </div>
      `;

      chartRef.current.innerHTML = chartHTML;
    }
  }, [results, useActualProbabilities]);

  return (
    <div className={`poker-odds-calculator ${className}`} style={{ 
      padding: '20px', 
      border: '1px solid var(--ifm-color-emphasis-300)', 
      borderRadius: '8px',
      backgroundColor: 'var(--ifm-background-color)'
    }}>
      <h3 style={{ color: 'var(--ifm-color-primary)', marginBottom: '20px' }}>
        Poker Odds Calculator
      </h3>

      {/* Player Count */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: 'var(--ifm-color-emphasis-700)', marginBottom: '10px' }}>
          Number of Players: {numPlayers}
        </h4>
        <input
          type="range"
          min="2"
          max="10"
          value={numPlayers}
          onChange={(e) => updateNumPlayers(Number(e.target.value))}
          style={{ width: '200px' }}
        />
      </div>

      {/* Hands Input - Column Layout */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: 'var(--ifm-color-emphasis-700)', marginBottom: '10px' }}>
          Player Hands
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${Math.min(5, numPlayers)}, 1fr)`,
          gap: '15px'
        }}>
          {hands.map((hand, handIndex) => (
            <div key={handIndex} style={{ 
              padding: '10px',
              border: '1px solid var(--ifm-color-emphasis-300)',
              borderRadius: '8px',
              backgroundColor: 'var(--ifm-color-emphasis-50)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                Hand {handIndex + 1}
              </div>
              {hand.map((card, cardIndex) => (
                <select
                  key={cardIndex}
                  value={card}
                  onChange={(e) => updateHand(handIndex, cardIndex, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '5px',
                    marginBottom: '5px',
                    border: '1px solid var(--ifm-color-emphasis-300)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--ifm-background-color)',
                    color: 'var(--ifm-font-color-base)'
                  }}
                >
                  <option value="">Select Card</option>
                  {fullDeck.map(optionCard => (
                    <option key={optionCard} value={optionCard} disabled={optionCard !== card && usedCards.has(optionCard)}>
                      {optionCard}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Board Cards */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: 'var(--ifm-color-emphasis-700)', marginBottom: '10px' }}>
          Community Cards (Board)
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '10px',
          width: '100%'
        }}>
          {board.map((card, index) => (
            <select
              key={index}
              value={card}
              onChange={(e) => updateBoard(index, e.target.value)}
              style={{
                width: '100%',
                padding: '5px',
                border: '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: '4px',
                backgroundColor: 'var(--ifm-background-color)',
                color: 'var(--ifm-font-color-base)'
              }}
            >
              <option value="">{index < 3 ? "Flop" : index === 3 ? "Turn" : "River"}</option>
              {fullDeck.map(optionCard => (
                <option key={optionCard} value={optionCard} disabled={optionCard !== card && usedCards.has(optionCard)}>
                  {optionCard}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Options */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: 'var(--ifm-color-emphasis-700)', marginBottom: '10px' }}>
          Simulation Options
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: '20px', alignItems: 'center' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Iterations: {iterations.toLocaleString()}</label>
            <input
              type="range"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              min={100}
              max={4000}
              step={100}
              style={{ width: '200px' }}
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <input
                type="checkbox"
                checked={useActualProbabilities}
                onChange={(e) => setUseActualProbabilities(e.target.checked)}
              />
              Actual (win% × possibility)
            </label>
          </div>
          
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={calculateOdds}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? 'var(--ifm-color-emphasis-300)' : 'var(--ifm-color-success)',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
        <button
          onClick={randomizeHands}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--ifm-color-warning)',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Randomize
        </button>
        <button
          onClick={clearAll}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--ifm-color-danger)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: 'var(--ifm-color-danger-lightest)',
          border: '1px solid var(--ifm-color-danger)',
          borderRadius: '4px',
          color: 'var(--ifm-color-danger-dark)',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h4 style={{ color: 'var(--ifm-color-emphasis-700)', marginBottom: '15px' }}>
            Results
          </h4>
          
          {/* Win Percentages */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${Math.min(5, results.length)}, 1fr)`,
            gap: '15px',
            marginBottom: '20px'
          }}>
            {(() => {
              const winRates = results.map(r => (r.wins / r.count) * 100);
              const minWin = Math.min(...winRates);
              const maxWin = Math.max(...winRates);
              return results.map((result, index) => {
                const winRate = (result.wins / result.count) * 100;
                const color = computeWinRateColor(winRate, minWin, maxWin);
                return (
                  <div key={index} style={{
                    padding: '15px',
                    border: `4px solid ${color}`,
                    borderRadius: '8px',
                    backgroundColor: 'var(--ifm-background-color)',
                    textAlign: 'center'
                  }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  Hand {index + 1}
                </div>
                <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '8px' }}>
                  {result.hand.map((card, cardIndex) => (
                    <span
                      key={cardIndex}
                      style={{
                        padding: '3px 6px',
                        backgroundColor: 'var(--ifm-color-emphasis-200)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {getCardDisplay(card)}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {formatPercentage(result.wins, result.ties, result.count)}
                </div>
                <div style={{ fontSize: '12px' }}>
                  {result.wins} wins, {result.ties} ties
                </div>
              </div>
                );
              });
            })()}
          </div>

          {/* Horizontal Bar Chart */}
          <div ref={chartRef} style={{ marginTop: '20px' }}></div>
        </div>
      )}
    </div>
  );
};

export default PokerOddsCalculator;