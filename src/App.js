import React from 'react';
import './App.css';
import {Container, Row, Col} from 'react-bootstrap';
import TextareaAutosize from 'react-autosize-textarea';
import {Alert} from 'react-bootstrap';
import {getFaceToFaceCardPrices, getWizardsCardPrices} from './CardServices';

export default class App extends React.Component{

  state = {deck: "", errorState: false, errorMessage: "", submitDisabled: false, cheaperOnF2F: "", cheaperOnWiz: "", totalPrice: 0};

  deckListStyle = {
    fontSize: '10px',
    margin: '10px',
  };

  constructor(){
    super();
    this.handleDeckChange = this.handleDeckChange.bind(this);
    this.submitDeckList = this.submitDeckList.bind(this);
    this.cardObjectToString = this.cardObjectToString.bind(this);
    this.enterErrorState = this.enterErrorState.bind(this);
  }

  handleDeckChange(event){
    this.setState({deck: event.target.value});
  }


  /**
   * Called when the deck is entered and the form is ready to go.
   * @param {The event of the button being pressed.} event 
   */
  async submitDeckList(event){
    event.preventDefault();
    this.setState({submitDisabled: true});

    if(this.state.deck === ""){
      this.enterErrorState("Decklist shouldn't be empty");
      return;
    }

    // Load the prices from the website.
    var wiz = await getWizardsCardPrices(this.state.deck);
    var f2f = await getFaceToFaceCardPrices(this.state.deck);

    //var wiz = {KarnLiberated: 10, CounterSpell: 2};
    //var f2f = {KarnLiberated: 4, CounterSpell: 5};

    var cards = [...new Set([...Object.keys(wiz), ...Object.keys(f2f)])];
    var originalList = this.state.deck.split("\n");

    if(cards.length !== originalList.length){
      this.setState({errorState: true, errorMessage: "Found " + cards.length + " cards out of " + originalList.length + " cards."});
    }

    var cheaperOnF2F = {};
    var cheaperOnWiz = {};
    var totalPrice = 0;

    // For each card, find out which service is cheaper and append it to its respective list.
    for(var name of cards){
      var f_price = 99999999999.0;
      var w_price = 99999999999.0;
      if(name in f2f){
        f_price = f2f[name];
      }
      if(name in wiz){
        w_price = wiz[name];
      }
      if(f_price < w_price){
        cheaperOnF2F[name] = f_price;
        totalPrice += f_price;
      }else{
        cheaperOnWiz[name] = w_price;
        totalPrice += w_price;
      }
    }

    // Update the state.
    this.setState({cheaperOnF2F: this.cardObjectToString(cheaperOnF2F), 
      cheaperOnWiz: this.cardObjectToString(cheaperOnWiz), totalPrice: totalPrice.toLocaleString('en-US', {style: 'currency', currency: 'CAD'})});


    this.setState({submitDisabled: false});

  }


  /**
   * Enter an error state and display a large message.
   * @param {The message to be displayed} message 
   */
  enterErrorState(message){
    this.setState({errorState: true, errorMessage: message});
  }


  /**
   * Converts a card list to a string to be printed in a box.
   * @param {The card lists with prices} obj 
   */
  cardObjectToString(obj){
    var output = "";
    for(const [key,] of Object.entries(obj)){
      output += key + "\n";
    }
    return output;
  }

  render(){

    let errorPrompt;
    if(this.state.errorState){
        errorPrompt = <Alert variant='danger'>{this.state.errorMessage}</Alert>
    }

    return (
      <Container>
      <link
      rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
      integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
      crossOrigin="anonymous"
      />
      {errorPrompt}
        <Col>
          <form onSubmit={this.submitDeckList}>
            <Row>
              <TextareaAutosize cols='50' style={this.deckListStyle} onChange={this.handleDeckChange} value={this.state.deck} />
            </Row>
            <Row>
              <input type="submit" style={this.deckListStyle} value="Submit" disabled={this.state.submitDisabled}/>
            </Row>
          </form>
        </Col>
        <Col>
          <Row>
            <h2>Cheaper on F2F</h2> 
            <TextareaAutosize cols = '50' style={this.deckListStyle} value={this.state.cheaperOnF2F} />
          </Row>
          <Row>
            <h2>Cheaper on WIZ</h2>
            <TextareaAutosize cols='50' style={this.deckListStyle} value={this.state.cheaperOnWiz} />
          </Row> 
        </Col>
        <Col>
          <h2>Total Price: {this.state.totalPrice}</h2>
        </Col>
      </Container>
    )
  }

}
