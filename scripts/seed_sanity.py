import urllib.request
import json
import os

PROJECT_ID = "1f99tgsv"
DATASET = "production"
API_VERSION = "2023-01-01"
TOKEN = "sk3Slg44b7Tu70uDG03pdVG5rhoMxQvJmuV994zWZ3gobWnFJicZouSioTgBlTM3P3f5PmxUVy6OM8Ae4GUBUvxmcTbip3vNfCxEqJkCfALfwcLuhpbRVfidq3FLZRDs09CtNmIrLcJVrWGqbErz1NGnunagYQbwM0Mbgx7yJn5s6wYwTI1Z"

MUTATE_URL = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/data/mutate/{DATASET}"
ASSET_UPLOAD_URL = f"https://{PROJECT_ID}.api.sanity.io/v{API_VERSION}/assets/images/{DATASET}"

def upload_image(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return None
    
    mime_type = "image/jpeg"
    if file_path.endswith(".png"):
        mime_type = "image/png"
        
    with open(file_path, "rb") as f:
        data = f.read()
        
    req = urllib.request.Request(
        ASSET_UPLOAD_URL,
        data=data,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": mime_type
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            print(f"Uploaded asset {file_path} -> {res_data['document']['_id']}")
            return res_data['document']['_id']
    except Exception as e:
        print(f"Error uploading asset {file_path}: {e}")
        return None

def seed_documents():
    bio_img_id = upload_image("asset/pics/foto_bio.jpg")
    brassage_img_id = upload_image("asset/pics/Brassage.jpg")
    sinestesia_img_id = upload_image("asset/pics/Sinestesia#1.jpg")
    learning_img_id = upload_image("asset/pics/learning.png")
    tempo_img_id = upload_image("asset/pics/Tempo_Reale_Collection.jpg")
    
    mutations = [
        {
            "createOrReplace": {
                "_id": "sanity-bio",
                "_type": "bio",
                "title": "About Bilecolar",
                "text": "Bruno Cusumano, in arte Bilecolar, è un Sound Designer e Music Producer la cui ricerca esplora i territori dell'acustica spaziale, del sound design sperimentale per arti visive e della composizione acusmatica. Attraverso sintesi modulare, elaborazione di registrazioni sul campo ed esplorazioni timbre/spazio, crea ambienti sonori immersivi e strutture compositive ad alta densità dinamica.",
                "image": {"_type": "image", "asset": {"_type": "reference", "_ref": bio_img_id}} if bio_img_id else None
            }
        },
        {
            "createOrReplace": {
                "_id": "homepage-settings",
                "_type": "homepageSettings",
                "subtitle": "Sound Designer / Music Producer",
                "localVideoUrl": "asset/background_video/background_lp.mp4"
            }
        },
        {
            "createOrReplace": {
                "_id": "work-brassage",
                "_type": "work",
                "title": "Brassage",
                "section": "Acousmatic",
                "description": "Composizione acusmatica fondata sulla tecnica del granulator brassage: micro-frammenti di materia sonora vengono ricombinati in tessiture timbriche in continua evoluzione spaziale.",
                "link": "https://soundcloud.com/brunocusumano",
                "cover": {"_type": "image", "asset": {"_type": "reference", "_ref": brassage_img_id}} if brassage_img_id else None
            }
        },
        {
            "createOrReplace": {
                "_id": "work-sinestesia1",
                "_type": "work",
                "title": "Sinestesia #1",
                "section": "Acousmatic",
                "description": "Studio elettroacustico sulla percezione tattile del suono. Frequenze sub-basse e transitori acuti dialogano in uno spazio tridimensionale ad alta definizione drammaturgica.",
                "link": "https://soundcloud.com/brunocusumano",
                "cover": {"_type": "image", "asset": {"_type": "reference", "_ref": sinestesia_img_id}} if sinestesia_img_id else None
            }
        },
        {
            "createOrReplace": {
                "_id": "work-learning",
                "_type": "work",
                "title": "I'm learning...",
                "section": "A/V",
                "description": "Performance Audio/Video interattiva che indaga l'apprendimento computazionale e il rapporto percettivo uomo-macchina tramite frammenti video e sintesi granulare in tempo reale.",
                "link": "https://instagram.com/bilecolar",
                "cover": {"_type": "image", "asset": {"_type": "reference", "_ref": learning_img_id}} if learning_img_id else None
            }
        },
        {
            "createOrReplace": {
                "_id": "work-temporeale",
                "_type": "work",
                "title": "Tempo Reale Collection",
                "section": "Release",
                "description": "Raccolta discografica pubblicata in collaborazione con il centro di ricerca sonorio Tempo Reale. Un catalogo di opere per nastro, elettronica dal vivo e ambienti acusmatici.",
                "link": "https://bandcamp.com/bilecolar",
                "cover": {"_type": "image", "asset": {"_type": "reference", "_ref": tempo_img_id}} if tempo_img_id else None
            }
        }
    ]
    
    payload = json.dumps({"mutations": mutations}).encode('utf-8')
    req = urllib.request.Request(
        MUTATE_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        },
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode('utf-8'))
            print("Successfully seeded Sanity documents!")
            print(res_data)
    except Exception as e:
        print(f"Error seeding documents: {e}")

if __name__ == "__main__":
    seed_documents()
