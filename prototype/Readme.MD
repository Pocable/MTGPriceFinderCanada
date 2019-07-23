# MTGPriceFinderCanada
A tool to search both face to face and wizards tower at the same time
to get the cheapest cards possible.

## Sidenotes
This program **ignores** sets, conditions, shipping prices, amount of available cards 
and pre-release cards. It will find the cheapest available card it can find. 
If you don't want the cheapest cards then **do not** use this.

## Setup
1. Install Python3
2. Navigate to where you cloned the project
3. Run pip3 install -r requirements.txt
4. Download a [chrome driver](http://chromedriver.chromium.org/downloads). I use [this one](https://chromedriver.storage.googleapis.com/index.html?path=76.0.3809.25/).
5. Move the chromedriver.exe so its in the same folder as the python file.
6. Done setup! See usage for how to use the program.

## Usage
1. Have a decklist prepaired [in the format below](#Format).
2. Launch the program after running through the installation using python3 MTGCardFinder.py.
3. Enter the decklist (for example, list.txt)
4. Wait for the program to finish.
5. Open facetoface.txt and wizards.txt. They contain the cheapest cards found for that service.

## <a name="Format">Deck File Format</a>
```
1 Brago's Representative
1 Brago, King Eternal
1 Capital Punishment
1 Choice of Damnations
1 Coercive Portal
1 Command Tower
``` 