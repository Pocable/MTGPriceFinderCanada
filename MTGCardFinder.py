from selenium import webdriver
from selenium.common.exceptions import TimeoutException
import threading
import time
import os


FACE_TO_FACE = "https://www.facetofacegames.com/products/multi_search"
WIZARDS_TOWER = "https://kanatacg.crystalcommerce.com/products/multi_search/"
PATH = os.path.dirname(os.path.realpath(__file__)) + "/chromedriver.exe"

face_prices = {}
wizards_prices = {}


# Extract the prices from the xpath string containing the condition and the valye. We currently do not care
# about card condition, art and pre orders.
def getPricesFromHTMLWizards(input):
    lines = input.split("\n")
    for i in range(0, len(lines)):
        try:
            lines[i] = float(lines[i].split("$ ")[1].split(" x")[0])
        except:
            print("Unable to determine " + lines[i] + " as a price. Specifically, " + lines[i].split("$ ")[1].split(" x")[0] + ".\nPlease report this.")
            return
    return lines


def getPricesFromHTMLFace(input):

    # Face to face lists cards out of stock as well as sales which really screw with this app. And there website code is not nice to navigate.
    # This code when it comes across a sale it WILL ADD IT to the prices, but since this gets the minimal price anyways it doesn't really matter.
    # as it would just grab the sale price. Pre orders are included and same thing as before, does not care about condition or art.
    lines = input.replace("\n", " ").split("$ ")
    prices = []
    left = 0
    right = 1
    while right < len(lines):
        if "Out of stock" not in lines[left]:
            prices.append(float(lines[right].split(" ", 1)[0]))
        left += 1
        right += 1
   
    return prices



# Search wizards tower for cards.
def searchWizardsTower(lines):

    global wizards_prices

    # Start browser searching on kanatacg
    browser = webdriver.Chrome(executable_path=PATH)
    browser.get(WIZARDS_TOWER)

    textinput = browser.find_element_by_id("multisearch_query")
    submit = browser.find_element_by_name("submit")

    # Enter all of the wanted cards and amounts.
    for s in lines:
        textinput.send_keys(s)

    # Submit the text lines
    submit.click()


    # Get all card names found.
    cards_html = browser.find_elements_by_class_name("header_row")

    # Get all possible values for all conditions and editions
    values_html = browser.find_elements_by_xpath("//table[@class='invisible-table' and not(@border='0')]")

    # Gets all the found card names.
    card_editions = {}

    # For each item in the cards found on the website, extract the name and the number of editions.
    for item in cards_html:
        info = item.text.split(" results for ")
        card_editions[info[1][1:-1]] = int(info[0])

    # For each item in the values html, get the prices for that edition. Save them in a array.
    values = []
    for item in values_html:
        values.append(getPricesFromHTMLWizards(item.text))


    index = 0
    optimal_prices = {}
    for card in card_editions:

        # amount is the number of edditions to check.
        amount = card_editions[card]

        # optimal is the optimal card value (currently minimal). Set to a high number
        optimal = 99999999999999.0

        # For each edition
        for i in range(index, index + amount ):
            for k in values[i]:
                if k < optimal:
                    optimal = k
        index += amount
        optimal_prices[card] = optimal

    
           
    

    # Close the browser once the webpage is loaded
    browser.close()
    wizards_prices = optimal_prices
    return optimal_prices




# Search face to face
def searchFaceToFace(lines):
    global face_prices

    # Start browser searching on kanatacg
    browser = webdriver.Chrome(executable_path=PATH)
    browser.get(FACE_TO_FACE)

    textinput = browser.find_element_by_id("multisearch_query")
    submit = browser.find_element_by_name("submit")

    # Enter all of the wanted cards and amounts.
    for s in lines:
        textinput.send_keys(s)

    # Submit the text lines
    submit.click()


    # Get all card names found.
    cards_html = browser.find_elements_by_tag_name("h3")

    # Get all possible values for all conditions and editions
    values_html = browser.find_elements_by_xpath("//div[@class='inner']")


    # Gets all the found card names.
    card_editions = {}

    for i in range(1, len(cards_html) - 1):
        info = cards_html[i].text.split(" results for ")
        card_editions[info[1][1:-1]] = int(info[0])

    values = []
    for item in values_html:
        values.append(getPricesFromHTMLFace(item.text))

    index = 0
    optimal_prices = {}
    for card in card_editions:

        # amount is the number of edditions to check.
        amount = card_editions[card]

        # optimal is the optimal card value (currently minimal). Set to a high number
        optimal = 99999999999999.0

        # For each edition
        for i in range(index, index + amount ):
            for k in values[i]:
                if k < optimal:
                    optimal = k
        index += amount
        optimal_prices[card] = optimal

    browser.close()
    face_prices = optimal_prices
    return optimal_prices

def main():
    # Load the file
    filename = input("Enter the deck list filename: ")

    if filename == None:
        return
    
    
    lines = []
    try:
        file = open(filename, "r")
        lines = file.readlines()
        file.close()
    except:
        print("Filename was invalid or the formatting is incorrect!")
        return

    # Start the treads to search wizards tower and face to face. This just makes it quicker
    wizards = threading.Thread(target=searchWizardsTower, args=(lines,))
    face = threading.Thread(target=searchFaceToFace, args=(lines,))
    wizards.start()
    face.start()

    face.join()
    wizards.join()

    # After the websites and data was found, merge the card lists in a set to get the entire deck.

    card_list = [*face_prices] + [*wizards_prices]
    card_list = list(dict.fromkeys(card_list))
    print(card_list)

    # Print if the cards we found overall is equal to the number of cards requested.
    print(f"{len(card_list)}/{len(lines)} Card were found!")
    if len(card_list) != len(lines):
        print(f"The length of found cards does not equal the number of searched cards.\nThere are either duplicate listings of cards or they are out of stock.")
    
    # For each card, determine if its cheaper on wizards or face to face.
    cheaper_on_wizards = {}
    cheaper_on_face = {}
    total_price = 0
    for name in card_list:
        f_price = 99999999999.0
        w_price = 99999999999.0
        if name in face_prices:
            f_price = face_prices[name]
        if name in wizards_prices:
            w_price = wizards_prices[name]
        if f_price < w_price:
            cheaper_on_face[name] = f_price
            total_price += f_price
        else:
            cheaper_on_wizards[name] = w_price
            total_price += w_price

    # Output the cheaper cards in facetoface.txt and wizards.txt.
    facefile = open("facetoface.txt", "w+")

    for card in cheaper_on_face:
        facefile.write(card + "\n")

    facefile.close()
    wizfile = open("wizards.txt", "w+")
    for card in cheaper_on_wizards:
        wizfile.write(card + "\n")
    wizfile.close()

    print("Total Cost: " + str(total_price))

    print("Finished searching and getting optimal prices. Check wizards.txt and facetoface.txt!")



main()
