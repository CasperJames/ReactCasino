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
      wallet: playerWalletPass,
      inputValue: '',
      currentBet: null,
      gameOver: false,
      message: null,
      playerWallet: playerWalletPass,
      playerHands: playerHandsPass,
      playerWins: playerWinsPass,
      playerLosses: playerLossesPass,
      userId: userIdPass
    };
  }

  // Shuffle the cards
  shuffleCards(deck) {
    deck = deck.sort(function(){ return Math.random() - 0.5});
    return deck;
  }

  // Generate the decks - utilizing 8 decks
  generateDecks() {
    const cards = [2,3,4,5,6,7,8,9,10,'J','Q','K','A'];
    const suits = ['Diamonds','Clubs','Hearts','Spades'];
    const deck = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < cards.length; j++) {
        for (let k = 0; k < suits.length; k++) {
          deck.push({number: cards[j], suit: suits[k]});
        }
      }
    }
    
    // Now that we have our decks, shuffle them
    for(let l = 0; l < 4; l++) {
    	this.shuffleCards(deck);
    }
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
    // Send back updated deck, player hand, dealer hand
    return {updatedDeck: playerCard2.updatedDeck, player, dealer};
  }

  // Start new game - are we continuing with wallet or resetting?
  startNewGame(type) {
    if (type === 'continue') {
      // Khajiit has wares, if you have coin
      if (this.state.wallet > 0) {
	// Recreate decks if you've played enough to only have 2 decks left
        const deck = (this.state.deck.length <= 104) ? this.generateDecks() : this.state.deck;
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
	// Khajiit has no wares for you - broke and need to reset.
        this.setState({ message: 'Your wallet is empty :( - please reset the game.' });
      }
    } else {
      // New game starts here
      const deck = this.generateDecks();
      const { updatedDeck, player, dealer } = this.dealCards(deck);
      let playerWallet = this.state.playerWallet;
      // Update game properties    
      this.setState({
        deck: updatedDeck,
        dealer,
        player,
        wallet: playerWallet,
        inputValue: '',
        currentBet: null,
        gameOver: false,
        message: null
      }, function() {
	console.log(this.state.playerWallet);
      });
    }
  }
  
  // Pull random card for deal - send back random card and deck without drawn card
  getRandomCard(deck) {
    const updatedDeck = deck;
    const randomIndex = 0;
    const randomCard = updatedDeck[randomIndex];
    updatedDeck.splice(randomIndex, 1);
    return { randomCard, updatedDeck };
  }
  
  // Place bet on hand - TODO: make this mandatory before cards dealt.
  placeBet(betVal) {
    const currentBet = betVal;
    if (currentBet > this.state.wallet) {
      this.setState({ message: 'You cannot bet more than the dollar amount in your wallet.' });
    } else if (currentBet % 1 !== 0) {
      // TODO: support decimal amounts
      this.setState({ message: 'You can only bet whole $ amounts' });
    } else {
      // Deduct current bet from wallet
      const wallet = this.state.wallet - currentBet;
      const playerWallet = this.state.playerWallet - currentBet;
      this.setState({ wallet, playerWallet, inputValue: '', currentBet });
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
	// Ace by default becomes 1 if player busts with 11
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

      // Dealer must keep drawing cards until count is 17 or more
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
          message: 'Dealer bust! You win!',
	  playerHands: Number(this.state.playerHands) + 1,
	  playerWins: Number(this.state.playerWins) +1,
	  playerWallet: this.state.wallet
        });
      } else {
        const winner = this.getWinner(dealer, this.state.player);
        let wallet = this.state.wallet;
        let message;
	let playerHands = this.state.playerHands;
	let playerWins = this.state.playerWins;
	let playerWallet = this.state.playerWallet;
	let playerLosses = this.state.playerLosses;
        
        if (winner === 'dealer') {
          message = 'Dealer wins!';
	  playerHands = Number(this.state.playerHands) + 1;
	  playerLosses = Number(this.state.Losses) + 1;
        } else if (winner === 'player') {
          wallet += this.state.currentBet * 2;
	  playerHands = Number(this.state.playerHands) + 1;
	  playerWins = Number(this.state.playerWins) + 1;
	  playerWallet != this.state.currentBet * 2;
          message = 'You win!';
        } else {
          wallet += this.state.currentBet;
	  playerWallet += this.state.currentBet;
	  playerHands = Number(this.state.playerHands) + 1;
          message = 'Push with ' + this.dealer.count + '!';
        }
        
	// Reset states after game
        this.setState({
          deck, 
          dealer,
          wallet,
	  playerWallet,
	  playerHands,
	  playerWins,
	  playerLosses,
          gameOver: true,
          message
        }, function() {
		console.log(this.state.playerWallet + " Wallet Player!");
	});
      } 
      axios({
  	method: 'post',
  	url: '/updatedata',
  	data: {
    		playerWalletData: this.state.playerWallet ,
    		playerHandsData: this.state.playerHands,
		playerWinsData: this.state.playerWins,
		playerLossesData: this.state.playerLosses,
		userIdData: userIdPass
  		}
     });
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
  
  // hook pre-render	
  componentWillMount() {
    this.startNewGame();
    const body = document.querySelector('body');
  }

  chipClick(chipCount) {
    console.log(chipCount + " count");
    this.placeBet(chipCount);
  }
  
  // On render - we make game magic here
  render() {
    let dealerCount;
    const card1 = this.state.dealer.cards[0].number;
    const card2 = this.state.dealer.cards[1].number;

    // Does dealer have more than 1 card?
    if (card2) {
      dealerCount = this.state.dealer.count;
    } else {
      // Handle face cards in count
      if (card1 === 'J' || card1 === 'Q' || card1 === 'K') {
        dealerCount = 10;
      } else if (card1 === 'A') {
        dealerCount = 11;
      } else {
	// Number card added to dealer count
        dealerCount = card1;
      }
    }

    // Return info to player for game - get input from player
    return (
      <div>
        <p class="gameP">Wallet: ${ this.state.wallet }</p>
        {
          !this.state.currentBet ?
          <div className="chips">
            <table class="chips">
	      <tr>
		<td>
		  <img class="chip-img" src="storage/Images/Chips/20.png" data-value="20" onClick={() => this.placeBet(20)} />
		</td>
		<td>
		  <img class="chip-img" src="storage/Images/Chips/50.png" data-value="50" onClick={() => this.placeBet(50)} />
		</td>
		<td>
		  <img class="chip-img" src="storage/Images/Chips/100.png" data-value="100" onClick={() => this.placeBet(100)} />
		</td>
	      </tr>
	    </table>
	  </div>
            : null
          }
	  <br />
	  <>
	    <div className="buttons">
              <button onClick={() => {this.startNewGame()}}>Reset</button>
              <button onClick={() => {this.hit()}}>Hit</button>
              <button onClick={() => {this.stand()}}>Stand</button>
            </div>
	  </>
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
    // If number exists show cards, else show card back
    (number) ? retString = retString + suit + "/" + number + ".png" : retString = retString + "Back.png";

    return(
	<td>
            <img class="playing-card" src={retString} />
	</td>
    );
  };

// Send output to screen in div
ReactDOM.render(<Game />, document.getElementById('divGame'));
