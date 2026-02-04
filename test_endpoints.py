import http.client
import json

conn = http.client.HTTPSConnection("soccer-football-info.p.rapidapi.com")

headers = {
    'x-rapidapi-key': "6a621c1e3emshf85fa7326e2c189p113198jsnfb0b0852c6e4",
    'x-rapidapi-host': "soccer-football-info.p.rapidapi.com"
}

# IDs found from previous scans
test_ids = {
    "Ligue 1": "f0644ed72e7c6a5c",
    "Premier League": "eb57e70ef2e7077e",
    "Champions League W": "d6a2463557a8e280"
}

endpoints = [
    "/championships/view/?id=",
    "/championships/standing/?id=",
    "/matches/championship/?id="
]

results = {}

for name, api_id in test_ids.items():
    results[name] = {}
    for ep in endpoints:
        url = f"{ep}{api_id}"
        try:
            conn.request("GET", url, headers=headers)
            res = conn.getresponse()
            data = json.loads(res.read().decode("utf-8"))
            results[name][ep] = data.get("status")
        except Exception as e:
            results[name][ep] = f"Error: {e}"

print(json.dumps(results, indent=4))
