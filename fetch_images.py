import requests
import re
import json
import time

def fetch_image(query, filename):
    print(f"Searching for {query}...")
    url = "https://duckduckgo.com/"
    res = requests.post(url, data={'q': query})
    search_obj = re.search(r'vqd=([\d-]+)\&', res.text)
    if not search_obj: 
        print("No vqd found")
        return False
    vqd = search_obj.group(1)
    
    headers = {
        'dnt': '1',
        'accept-encoding': 'gzip, deflate, sdch',
        'x-requested-with': 'XMLHttpRequest',
        'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6,ms;q=0.4',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'referer': 'https://duckduckgo.com/',
        'authority': 'duckduckgo.com',
    }
    params = (
        ('l', 'us-en'),
        ('o', 'json'),
        ('q', query),
        ('vqd', vqd),
        ('f', ',,,'),
        ('p', '1'),
        ('v7exp', 'a'),
    )
    requestUrl = "https://duckduckgo.com/i.js"
    try:
        res = requests.get(requestUrl, headers=headers, params=params)
        data = json.loads(res.text)
        for result in data.get("results", []):
            img_url = result["image"]
            print(f"Found image: {img_url}")
            if not img_url.lower().endswith(('.png', '.jpg', '.jpeg')):
                continue
            try:
                img_data = requests.get(img_url, timeout=5).content
                with open(filename, 'wb') as handler:
                    handler.write(img_data)
                print(f"Successfully saved {filename}")
                return True
            except Exception as e:
                print(f"Failed to download {img_url}: {e}")
                continue
    except Exception as e:
        print(f"Failed to search: {e}")
    return False

fetch_image("paper boat aamras juice pouch product isolated", "public/images/aamras.png")
time.sleep(1)
fetch_image("paper boat chilli guava juice pouch product isolated", "public/images/chilliguava.png")
time.sleep(1)
fetch_image("paper boat jaljeera juice pouch product isolated", "public/images/jaljeera.png")
time.sleep(1)
fetch_image("paper boat aam panna juice pouch product isolated", "public/images/aampanna.png")
time.sleep(1)
fetch_image("paper boat santra juice pouch product isolated", "public/images/santra.png")
