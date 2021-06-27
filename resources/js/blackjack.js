import React from 'react';
import ReactDOM from 'react-dom';

class Game extends React.Component {
  constructor(props) {
    super(props);
    // Game Properties
    this.state = {
      deck: [],
      dealer: null,
      player: null,
      wallet: 0,
      inputValue: '',
      currentBet: null,
      gameOver: false,
      message: null
    };
  }

  // Generate the decks - utilizing 8 decks for 3:2 game rather than 6:5
  generateDecks() {
    const cards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
    const suits = ['Diamonds','Clubs','Hearts','Spades'];
    const deck = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < cards.length; j++) {
        for (let k = 0; k < suits.length; k++) {
          deck.push({number: cards[j], suit: suits[k]});
        }
      }
    }
    //Make sure we have 8 decks :)
    console.table(deck);
    return deck;
  }
  
  // Deal first 2 cards
  dealCards(deck) {
    const playerCard1 = this.getRandomCard(deck);
    const dealerCard1 = this.getRandomCard(playerCard1.updatedDeck);
    const playerCard2 = this.getRandomCard(dealerCard1.updatedDeck);    
    const playerStartingHand = [playerCard1.randomCard, playerCard2.randomCard];
    const dealerStartingHand = [dealerCard1.randomCard, {}];
    
    const player = {
      cards: playerStartingHand,
      count: this.getCount(playerStartingHand)
    };
    const dealer = {
      cards: dealerStartingHand,
      count: this.getCount(dealerStartingHand)
    };
    
    return {updatedDeck: playerCard2.updatedDeck, player, dealer};
  }

  // Start new game - are we continuing with wallet or resetting?
  startNewGame(type) {
    if (type === 'continue') {
      if (this.state.wallet > 0) {
        const deck = (this.state.deck.length < 10) ? this.generateDecks() : this.state.deck;
        const { updatedDeck, player, dealer } = this.dealCards(deck);

        this.setState({
          deck: updatedDeck,
          dealer,
          player,
          currentBet: null,
          gameOver: false,
          message: null
        });
      } else {
        this.setState({ message: 'Your wallet is empty :( - please start a new game.' });
      }
    } else {
      const deck = this.generateDecks();
      const { updatedDeck, player, dealer } = this.dealCards(deck);

      this.setState({
        deck: updatedDeck,
        dealer,
        player,
        wallet: 100,
        inputValue: '',
        currentBet: null,
        gameOver: false,
        message: null
      });
    }
  }
  
  // Pull random card for deal - send back deck without drawn card
  getRandomCard(deck) {
    const updatedDeck = deck;
    const randomIndex = Math.floor(Math.random() * updatedDeck.length);
    const randomCard = updatedDeck[randomIndex];
    updatedDeck.splice(randomIndex, 1);
    return { randomCard, updatedDeck };
  }
  
  // Place bet on hand - should be placed before cards dealt
  placeBet() {
    const currentBet = this.state.inputValue;

    if (currentBet > this.state.wallet) {
      this.setState({ message: 'There\'s not enough in your wallet to make that bet.' });
    } else if (currentBet % 1 !== 0) {
      this.setState({ message: 'You can only bet whole $ amounts' });
    } else {
      // Deduct current bet from wallet
      const wallet = this.state.wallet - currentBet;
      this.setState({ wallet, inputValue: '', currentBet });
    }
  }
  
  // Player hit
  hit() {
    if (!this.state.gameOver) {
      if (this.state.currentBet) {
        const { randomCard, updatedDeck } = this.getRandomCard(this.state.deck);
        const player = this.state.player;
        player.cards.push(randomCard);
        player.count = this.getCount(player.cards);

        if (player.count > 21) {
          this.setState({ player, gameOver: true, message: 'BUST!' });
        } else {
          this.setState({ deck: updatedDeck, player });
        }
      } else {
        this.setState({ message: 'Please place bet.' });
      }
    } else {
      this.setState({ message: 'Game over! Please start a new game.' });
    }
  }
  
  // Dealer draw 
  dealerDraw(dealer, deck) {
    const { randomCard, updatedDeck } = this.getRandomCard(deck);
    dealer.cards.push(randomCard);
    dealer.count = this.getCount(dealer.cards);
    return { dealer, updatedDeck };
  }
 
  // Counting cards - tsk tsk
  getCount(cards) {
    const rearranged = [];
    cards.forEach(card => {
      if (card.number === 'A') {
        rearranged.push(card);
      } else if (card.number) {
        rearranged.unshift(card);
      }
    });
    
    return rearranged.reduce((total, card) => {
      if (card.number === 'J' || card.number === 'Q' || card.number === 'K') {
        return total + 10;
      } else if (card.number === 'A') {
        return (total + 11 <= 21) ? total + 11 : total + 1;
      } else {
        return total + card.number;
      }
    }, 0);
  }
  
  // Player Stands
  stand() {
    if (!this.state.gameOver) {
      // Show dealer's 2nd card
      const randomCard = this.getRandomCard(this.state.deck);
      let deck = randomCard.updatedDeck;
      let dealer = this.state.dealer;
      dealer.cards.pop();
      dealer.cards.push(randomCard.randomCard);
      dealer.count = this.getCount(dealer.cards);

      // Keep drawing cards until count is 17 or more
      while(dealer.count < 17) {
        const draw = this.dealerDraw(dealer, deck);
        dealer = draw.dealer;
        deck = draw.updatedDeck;
      }

      // Dealer busts - player wins.
      if (dealer.count > 21) {
        this.setState({
          deck,
          dealer,
          wallet: this.state.wallet + this.state.currentBet * 2,
          gameOver: true,
          message: 'Dealer bust! You win!'
        });
      } else {
        const winner = this.getWinner(dealer, this.state.player);
        let wallet = this.state.wallet;
        let message;
        
        if (winner === 'dealer') {
          message = 'Dealer wins!';
        } else if (winner === 'player') {
          wallet += this.state.currentBet * 2;
          message = 'You win!';
        } else {
          wallet += this.state.currentBet;
          message = 'Push with ' + this.dealer.count + '!';
        }
        
	// Reset states after game
        this.setState({
          deck, 
          dealer,
          wallet,
          gameOver: true,
          message
        });
      } 
    } else {
      this.setState({ message: 'Game over! Please start a new game.' });
    }
  }
  
  // And the winner is?
  getWinner(dealer, player) {
    if (dealer.count > player.count) {
      return 'dealer';
    } else if (dealer.count < player.count) {
      return 'player';
    } else {
      return 'push';
    }
  }
  
  inputChange(e) {
    const inputValue = +e.target.value;
    this.setState({inputValue});
  }
  
  // Make enter commit bet
  handleKeyDown(e) {
    const enter = 13;
    console.log(e.keyCode);
    
    if (e.keyCode === enter) {
      this.placeBet();
    }
  }
  
  // hook pre-render	
  componentWillMount() {
    this.startNewGame();
    const body = document.querySelector('body');
    body.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  // On render - we make game magic here
  render() {
    let dealerCount;
    const card1 = this.state.dealer.cards[0].number;
    const card2 = this.state.dealer.cards[1].number;
    if (card2) {
      dealerCount = this.state.dealer.count;
    } else {
      if (card1 === 'J' || card1 === 'Q' || card1 === 'K') {
        dealerCount = 10;
      } else if (card1 === 'A') {
        dealerCount = 11;
      } else {
        dealerCount = card1;
      }
    }

    // Return info to player for game - get input from player
    return (
      <div>
        <div className="buttons">
          <button onClick={() => {this.startNewGame()}}>Reset</button>
          <button onClick={() => {this.hit()}}>Hit</button>
          <button onClick={() => {this.stand()}}>Stand</button>
        </div>
        <br /> 
        <p class="gameP">Wallet: ${ this.state.wallet }</p>
        {
          !this.state.currentBet ? 
          <div className="input-bet">            
            <form>
              <input type="text" name="bet" placeholder="" value={this.state.inputValue} onChange={this.inputChange.bind(this)}/>
            </form>
            <button onClick={() => {this.placeBet()}}>Place Bet</button>
          </div>
          : null
        }
        {
          this.state.gameOver ?
          <div className="buttons">
            <button onClick={() => {this.startNewGame('continue')}}>Continue</button>
          </div>
          : null
        }
        <p class="gameP">Your Hand ({ this.state.player.count })</p>
        <table className="cards">
          <tr>
            { this.state.player.cards.map((card, i) => {
              return <Card key={i} number={card.number} suit={card.suit}/>
            }) }
          </tr>
        </table>
        
        <p class="gameP">Dealer's Hand ({ this.state.dealer.count })</p>
        <table className="cards">
          <tr>
            { this.state.dealer.cards.map((card, i) => {
              return <Card key={i} number={card.number} suit={card.suit}/>;
            }) }
          </tr>
        </table>
        
        <p class="gameP">{ this.state.message }</p>
      </div>
    );
  }
};

  const Card = ({ number, suit }) => {
    var retString = "storage/Images/Cards/";
    const combo = (number) ? retString = retString + suit + "/" + number + ".png" : retString = retString + "Back.png";

    return(
	<td>
            <img class="playing-card" src={retString} />
	</td>
    );
  };

ReactDOM.render(<Game />, document.getElementById('divGame'));
