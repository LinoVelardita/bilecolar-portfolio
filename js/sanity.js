/* ==========================================================================
   SANITY API CLIENT & GROQ QUERY PROVIDER (Static Vanilla JS)
   ========================================================================== */

const SanityClient = {
    getUrl(query) {
        const { projectId, dataset, apiVersion } = window.SANITY_CONFIG;
        const encodedQuery = encodeURIComponent(query);
        return `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodedQuery}`;
    },

    async query(groq) {
        try {
            const url = this.getUrl(groq);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Sanity fetch error: ${response.status}`);
            const data = await response.json();
            return data.result || [];
        } catch (err) {
            console.warn("Sanity query error, using local fallback data:", err);
            return null;
        }
    },

    // 1. Fetch Bio Document
    async getBio() {
        const groq = `*[_type == "bio"][0]{
            title,
            text,
            "imageUrl": image.asset->url
        }`;
        const result = await this.query(groq);
        if (result) return result;

        // Fallback Bio
        return {
            title: "About Bilecolar",
            text: "Bruno Cusumano, in arte Bilecolar, è un Sound Designer e Music Producer la cui ricerca esplora i territori dell'acustica spaziale, del sound design sperimentale per arti visive e della composizione acusmatica. Attraverso sintesi modulare, elaborazione di registrazioni sul campo ed esplorazioni timbre/spazio, crea ambienti sonori immersivi e strutture compositive ad alta densità dinamica.",
            imageUrl: "asset/pics/foto_bio.jpg"
        };
    },

    // 2. Fetch Works Collections (Acousmatic, A/V, Release)
    async getWorks(section) {
        const groq = `*[_type == "work"${section ? ` && section == "${section}"` : ''}]{
            _id,
            title,
            section,
            description,
            link,
            "coverUrl": cover.asset->url
        }`;
        const result = await this.query(groq);
        if (result && result.length > 0) return result;

        // Fallback Works List
        const localWorks = [
            {
                _id: "w1",
                title: "Brassage",
                section: "Acousmatic",
                description: "Composizione acusmatica fondata sulla tecnica del granulator brassage: micro-frammenti di materia sonora vengono ricombinati in tessiture timbriche in continua evoluzione spaziale.",
                link: "https://soundcloud.com/brunocusumano",
                coverUrl: "asset/pics/Brassage.jpg"
            },
            {
                _id: "w2",
                title: "Sinestesia #1",
                section: "Acousmatic",
                description: "Studio elettroacustico sulla percezione tattile del suono. Frequenze sub-basse e transitori acuti dialogano in uno spazio tridimensionale ad alta definizione drammaturgica.",
                link: "https://soundcloud.com/brunocusumano",
                coverUrl: "asset/pics/Sinestesia.jpg"
            },
            {
                _id: "w3",
                title: "I'm learning...",
                section: "av",
                description: "Performance Audio/Video interattiva che indaga l'apprendimento computazionale e il rapporto percettivo uomo-macchina tramite frammenti video e sintesi granulare in tempo reale.",
                link: "https://instagram.com/bilecolar",
                coverUrl: "asset/pics/learning.png"
            },
            {
                _id: "w4",
                title: "Tempo Reale Collection",
                section: "Release",
                description: "Raccolta discografica pubblicata in collaborazione con il centro di ricerca sonorio Tempo Reale. Un catalogo di opere per nastro, elettronica dal vivo e ambienti acusmatici.",
                link: "https://bandcamp.com/bilecolar",
                coverUrl: "asset/pics/Tempo_Reale_Collection.jpg"
            }
        ];

        if (section) {
            return localWorks.filter(w => w.section.toLowerCase() === section.toLowerCase());
        }
        return localWorks;
    },

    // 3. Fetch Homepage Settings (Background video)
    async getHomepageSettings() {
        const groq = `*[_type == "homepageSettings"][0]{
            subtitle,
            "videoUrl": backgroundVideo.asset->url
        }`;
        const result = await this.query(groq);
        if (result) return result;

        return {
            subtitle: "Sound Designer / Music Producer",
            videoUrl: "asset/background_video/background_lp.mp4"
        };
    }
};

window.SanityClient = SanityClient;
