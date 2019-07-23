import React from 'react';
import './App.css';
import TextareaAutosize from 'react-autosize-textarea';
import {Alert} from 'react-bootstrap';
import {getFaceToFaceCardPrices, getWizardsCardPrices} from './CardServices';
import './bootstrap.min.css';
import {Row, Col, Container} from 'react-bootstrap';

export default class App extends React.Component{

  state = {deck: "", errorState: false, errorMessage: "", infoState: false, infoMessage: "", submitDisabled: false, cheaperOnF2F: "", cheaperOnWiz: "", totalPrice: "Submit A Deck!", missingCards: ""};

  constructor(){
    super();
    this.handleDeckChange = this.handleDeckChange.bind(this);
    this.submitDeckList = this.submitDeckList.bind(this);
    this.cardObjectToString = this.cardObjectToString.bind(this);
    this.enterErrorState = this.enterErrorState.bind(this);
    this.enterInfoState = this.enterInfoState.bind(this);
    this.clearErrorState = this.clearErrorState.bind(this);
    this.infoState = this.clearInfoState.bind(this);
    this.arrayToString = this.arrayToString.bind(this);
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
    window.scrollTo(0,0);
    this.clearErrorState();
    this.clearInfoState();

    if(this.state.deck === ""){
      this.enterErrorState("Decklist shouldn't be empty");
      return;
    }

    // Set message to let people know we are loading.
    this.enterInfoState("Loading...");

    // Load the prices from the website.
    var wiz = await getWizardsCardPrices(this.state.deck);
    var f2f = await getFaceToFaceCardPrices(this.state.deck);

    var cards = [...new Set([...Object.keys(wiz), ...Object.keys(f2f)])];
    var originalList = this.state.deck.replace(/([0-9][x ]{1,2})/g, "").split("\n");

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

    // Get the cards missing. Lowercase both lists as I am using .includes.
    originalList = originalList.map(v => {return v.toLowerCase()});
    cards = cards.map(v => {return v.toLowerCase()});
    var missing = originalList.filter(v => {
      return !cards.includes(v.toLowerCase());
    });

    // Update the state.
    this.setState({cheaperOnF2F: this.cardObjectToString(cheaperOnF2F), missingCards: this.arrayToString(missing),
      cheaperOnWiz: this.cardObjectToString(cheaperOnWiz), totalPrice: totalPrice.toLocaleString('en-US', {style: 'currency', currency: 'CAD'})});

    // Clear info state and re-enable the submit.
    this.clearInfoState();
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
   * Clear the error state (close it at top of page).
   */
  clearErrorState(){
    this.setState({errorState: false});
  }

  /**
   * Enter an info state and display a large message.
   * @param {The message to be displayed} message 
   */
  enterInfoState(message){
    this.setState({infoState: true, infoMessage: message});
  }

  /**
   * Exit the info state (close it at top of page).
   */
  clearInfoState(){
    this.setState({infoState: false});
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
    return output.trim();
  }

  /**
   * Convert an array to a string.
   * @param {An array.} arry 
   */
  arrayToString(arry){
    var output = "";
    for(var i = 0; i < arry.length; i++){
      output += arry[i] + "\n";
    }
    return output.trim();
  }

  render(){

    let errorPrompt;
    if(this.state.errorState){
        errorPrompt = <Alert variant='danger'>{this.state.errorMessage}</Alert>
    }

    let infoPrompt;
    if(this.state.infoState){
      infoPrompt = <Alert variant='warning'>{this.state.infoMessage}</Alert>
    }

    return (
      <div className="App">
        {errorPrompt}
        {infoPrompt}
        <Container>
          <Row>
            <Col>
              <form onSubmit={this.submitDeckList}>
                <Col>
                  <h2>Decklist</h2>
                  <TextareaAutosize cols='50' onChange={this.handleDeckChange} value={this.state.deck} />
                </Col>
                <Col>
                  <input style={{margin: '20px'}} type="submit" value="Submit" disabled={this.state.submitDisabled}/>
                </Col>
              </form>
            </Col>
            <Col>
              <Col>
              <a href="https://www.facetofacegames.com/products/multi_search"><h2>Cheaper on Face to Face</h2></a>
              <TextareaAutosize cols='50' value={this.state.cheaperOnF2F} />
              </Col>
              <Col>
              <a href="https://kanatacg.crystalcommerce.com/products/multi_search"><h2>Cheaper on Wizards</h2></a>
              <TextareaAutosize cols='50' value={this.state.cheaperOnWiz} />
              </Col>
              <Col>
              <h2>Total Price: {this.state.totalPrice}</h2>
              </Col>
            </Col>
            <Col>
              <h2>Missing Cards</h2>
              <TextareaAutosize cols='50' value={this.state.missingCards}></TextareaAutosize>
            </Col>
          </Row>
          <Row>
            <Col>
              <h4>Disclaimer:</h4>
              <p> This program ignores sets, conditions, shipping prices, amount of cards and the option of purchasing pre-release cards.
                It only finds the cheapest card available and shows you where to find it. If you care about condition and art, you should not use this!
              </p>
            </Col>
          </Row>
          </Container>
      </div>
    )
  }

}
