import http.client
import json

conn = http.client.HTTPSConnection("soccer-football-info.p.rapidapi.com")

headers = {
    'x-rapidapi-key': "6a621c1e3emshf85fa7326e2c189p113198jsnfb0b0852c6e4",
    'x-rapidapi-host': "soccer-football-info.p.rapidapi.com"
}

# The list endpoint handles pagination. We search first few pages for keywords.
found = {}
keywords = ["Bundesliga", "Champions League", "Europa League", "World Cup"]

for p in range(1, 10): # Check first 10 pages
    try:
        conn.request("GET", f"/championships/list/?p={p}", headers=headers)
        res = conn.getresponse()
        data = json.loads(res.read().decode("utf-8"))
        results = data.get("result", [])
        for item in results:
            for kw in keywords:
                if kw.lower() in item["name"].lower():
                    if kw not in found: found[kw] = []
                    found[kw].append(item)
    except Exception as e:
        print(f"Error on page {p}: {e}")

with open("missing_leagues.json", "w", encoding="utf-8") as f:
    json.dump(found, f, indent=4)

print("Search complete.")
