export default {
  name: 'work',
  title: 'Works',
  type: 'document',
  fields: [
    { name: 'title', title: 'Titolo Progetto', type: 'string' },
    { name: 'section', title: 'Sezione', type: 'string', options: { list: ['Acousmatic', 'A/V', 'Release'] } },
    { name: 'description', title: 'Descrizione', type: 'text' },
    { name: 'cover', title: 'Copertina / Cover Image', type: 'image', options: { hotspot: true } },
    { name: 'link', title: 'Link Esterno (SoundCloud / Bandcamp / etc.)', type: 'url' }
  ]
}