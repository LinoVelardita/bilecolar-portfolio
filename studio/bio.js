export default {
  name: 'bio',
  title: 'Bio',
  type: 'document',
  fields: [
    { name: 'title', title: 'Titolo', type: 'string' },
    { name: 'text', title: 'Testo Biografia', type: 'text' },
    { name: 'image', title: 'Foto Bio', type: 'image', options: { hotspot: true } }
  ]
}