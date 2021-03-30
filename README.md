# NOTICE

Face to Face and Wizards have both updated their websites and the **application no longer works**. The website will be taken down but this repository will be left public for anyone to modify the code or attempt to revive it. Everything that would need to be changed would be in the CardServices.js class. A starting point would be to update the endpoints, but since Face to Face does not have a batch search anymore and its default card search recommends cards, it would be more difficult to search. Wizards tower just added foil and full art indicators after a dash, which can be easily removed to be updated.

# MTGPriceFinderCanada
A tool to search both face to face and wizards tower at the same time to get the cheapest cards possible.

## Sidenotes
This program **ignores** sets, conditions, shipping prices, amount of available cards 
and pre-release cards. It will find the cheapest available card it can find. 
If you don't want the cheapest cards possible then **do not** use this.

## Developer Setup
1. Clone the repository.
2. Run ```npm install``` in the main directory to install the missing packages.
3. Run ```npm start``` in the main directory to start a development server.

## Usage
1. Either setup a local copy or [visit the official site](https://pocable.github.io/MTGPriceFinderCanada/).
2. Paste a deck list into the Decklist text box.
3. Hit submit and let the program scrape FacetoFace and Wizards for prices.
4. Once finished, the cards cheaper on each store will be put into their boxes and a total price will be shown.

## <a name="Format">Deck File Format</a>
Use either of the formats below:
```
1 Brago's Representative
1 Brago, King Eternal
1 Capital Punishment
1 Choice of Damnations
1 Coercive Portal
1 Command Tower
``` 
```
1x Brago's Representative
1x Brago, King Eternal
1x Capital Punishment
1x Choice of Damnations
1x Coercive Portal
1x Command Tower
``` 
```
Brago's Representative
Brago, King Eternal
Capital Punishment
Choice of Damnations
Coercive Portal
Command Tower
``` 
