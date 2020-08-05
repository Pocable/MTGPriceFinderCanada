import React from 'react';
import './App.css';
import TextareaAutosize from 'react-autosize-textarea';
import {Alert} from 'react-bootstrap';
import {getFaceToFaceCardPrices, getWizardsCardPrices} from './CardServices';
import './bootstrap.min.css';
import {Row, Col, Container} from 'react-bootstrap';

export default class App extends React.Component{

  state = {deck: "", errorState: false, errorMessage: "", infoState: false, infoMessage: "", submitDisabled: false, 
  cheaperOnF2F: "", cheaperOnWiz: "", totalPrice: "CA$0.00", missingCards: "", wizardsCost: "CA$0.00", facetofaceCost: "CA$0.00", 
  successState: false, successMessage: "", wizCards: 0, f2fCards: 0};

  constructor(){
    super();
    this.handleDeckChange = this.handleDeckChange.bind(this);
    this.submitDeckList = this.submitDeckList.bind(this);
    this.cardObjectToString = this.cardObjectToString.bind(this);
    this.enterErrorState = this.enterErrorState.bind(this);
    this.enterInfoState = this.enterInfoState.bind(this);
    this.arrayToString = this.arrayToString.bind(this);
    this.formatStringToCurrency = this.formatStringToCurrency.bind(this);
    this.enterSuccessState = this.enterSuccessState.bind(this);
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
    this.setState({submitDisabled: true, successState: false, errorState: false, infoState: false});
    window.scrollTo(0,0);

    if(this.state.deck === ""){
      this.enterErrorState("Decklist shouldn't be empty");
      this.setState({submitDisabled: false});
      return;
    }

    // Set message to let people know we are loading.
    this.enterInfoState("Loading...");

    // Load the prices from the website.
    try{
      var wiz = await getWizardsCardPrices(this.state.deck);
      var f2f = await getFaceToFaceCardPrices(this.state.deck);
    }catch(err){
      this.setState({submitDisabled: false});
      this.enterErrorState("Error: " + err);
      console.error(err);
      return;
    }

    var cards = [...new Set([...Object.keys(wiz), ...Object.keys(f2f)])];
    var originalList = this.state.deck.replace(/([0-9][x ]{1,2})/g, "").split("\n");


    // Statistics and values
    var cheaperOnF2F = {};
    var cheaperOnWiz = {};
    var totalPrice = 0;
    var totalWizardsPrice = 0;
    var totalFaceToFacePrice = 0;

    // For each card, find out which service is cheaper and append it to its respective list.
    for(var name of cards){
      var f_price = 99999999999.0;
      var w_price = 99999999999.0;
      if(name in f2f){
        f_price = f2f[name];
        totalFaceToFacePrice += f_price;
      }
      if(name in wiz){
        w_price = wiz[name];
        totalWizardsPrice += w_price;
      }
      if(f_price < w_price){
        cheaperOnF2F[name] = f_price;
        totalPrice += f_price;
      }else{
        cheaperOnWiz[name] = w_price;
        totalPrice += w_price;
      }
    }

    // Get the cards missing. Lowercase both lists as I am using .includes. Remove any empty cards aswell.
    originalList = originalList.map(v => {return v.toLowerCase()});
    cards = cards.map(v => {return v.toLowerCase()});
    var missing = originalList.filter(v => {
      if(v === "") { return false; }
      return !cards.includes(v.toLowerCase());
    });

    // If the missing list has a card, then we are missing cards.
    if(missing.length > 0){

      // Check if we need to append an s to the end or not.
      var needS = '';
      if(missing.length !== 1){
        needS = 's';
      }

      // Update state.
      this.setState({errorState: true, errorMessage: "Found " + missing.length + " missing card" + needS + "."});
    }
        

    // Update the state.
    this.setState({cheaperOnF2F: this.cardObjectToString(cheaperOnF2F), missingCards: this.arrayToString(missing),
      cheaperOnWiz: this.cardObjectToString(cheaperOnWiz), totalPrice: this.formatStringToCurrency(totalPrice),
    wizardsCost: this.formatStringToCurrency(totalWizardsPrice), facetofaceCost: this.formatStringToCurrency(totalFaceToFacePrice),
    wizCards: Object.keys(wiz).length, f2fCards: Object.keys(f2f).length});

    // Clear info state and re-enable the submit.
    this.setState({submitDisabled: false, infoState: false});

    if(!this.state.errorState){
      this.enterSuccessState("All cards found!");
    }

  }


  /**
   * Format a string to match a local string. In this case, CAD.
   * @param {The string to be formatted.} string 
   */
  formatStringToCurrency(string){
    return string.toLocaleString('en-US', {style: 'currency', currency: 'CAD'});
  }


  /**
   * Enter an error state and display a large message.
   * @param {The message to be displayed} message 
   */
  enterErrorState(message){
    this.setState({errorState: true, errorMessage: message});
  }

  /**
   * Enter an info state and display a large message.
   * @param {The message to be displayed} message 
   */
  enterInfoState(message){
    this.setState({infoState: true, infoMessage: message});
  }

  /**
   * Enter a success state and display a large message
   * @param {The message to be displayed} message 
   */
  enterSuccessState(message){
    this.setState({successState: true,successMessage: message});
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

    let successPrompt;
    if(this.state.successState){
      successPrompt = <Alert variant='success'>{this.state.successMessage}</Alert>
    }

    return (
      <div className="App">
                <Alert variant='danger'>Unfortunetly, FaceToFace updated their website and no longer has a batch search function. I am unable to update this currently until it's added. Sorry!</Alert>
        {errorPrompt}
        {infoPrompt}
        {successPrompt}
        <Container>
          <Row>
            <Col>
              <h1>MTGPriceCheck Canada</h1>
              <p>Enter your deck and this program will search Face to Face and Wizards Tower to compare which card is cheaper at what storefront. You can paste the generated lists into their deck builders and add them to your card.</p>
            </Col>
          </Row>
          <Row>
            <Col>
              <form onSubmit={this.submitDeckList}>
                <Col>
                  <h2>Decklist</h2>
                  <h6>One card per line, formatted either <code>1x Karn Liberated</code>, <code>1 Karn Liberated</code>, or <code>Karn Liberated</code>.</h6>
                  <TextareaAutosize cols='50' onChange={this.handleDeckChange} value={this.state.deck} />
                </Col>
                <Col>
                  <input style={{margin: '20px'}} type="submit" value="Submit" disabled={this.state.submitDisabled}/>
                </Col>
              </form>
            </Col>
            <Col>
              <Col>
              <strike><h2>Cheaper on Face to Face</h2></strike>
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
            <Col>
            <h2>Using one website </h2>
              <h4>Face To Face Cost: {this.state.facetofaceCost} - Cards: {this.state.f2fCards}</h4>
              <h4>Wizards Tower Cost: {this.state.wizardsCost} - Cards: {this.state.wizCards}</h4>
              <p>(If a website is lower than the total cost it may be missing cards)</p>
            </Col>
          </Row>
          <Row>
            <Col>
              <h4>Disclaimer:</h4>
              <p> 
                This program ignores sets, conditions, shipping prices, amount of cards and the option of purchasing pre-release cards.
                It only finds the cheapest card available and shows you where to find it. If you care about condition and art, you should not use this!
              </p>
            </Col>
          </Row>
          <Row>
            <Col>
              <a href="https://github.com/Pocable/MTGPriceFinderCanada/issues"><h1>Report a Problem</h1></a>
            </Col>
          </Row>
          </Container>
      </div>
    )
  }

}
