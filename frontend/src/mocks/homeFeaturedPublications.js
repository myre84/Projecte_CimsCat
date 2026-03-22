// Aquest fitxer no ve de backend.
// És un mock temporal que fem servir per poder continuar el frontend encara que l'API no estigui preparada.
// La idea és que més endavant aquestes dades es substitueixin per una crida real.
export const homeFeaturedPublications = [
  {
    // id intern del mock.
    id: 1,
    // peakId és l'id del cim, que fem servir per enllaçar amb la fitxa oficial del cim.
    peakId: 101,
    // publicationId seria l'id propi de la publicació d'usuari.
    publicationId: 1001,
    peakName: "Pica d'Estats",
    elevation: 3143,
    region: "Pallars Sobira",
    authorName: "Mireia",
    likes: 28,
    excerpt: "La porta del cel a Catalunya!",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80",
    lat: 42.6669,
    lng: 1.4069,
  },
  {
    // Repetim la mateixa estructura per mantenir les dades homogènies i fàcils de reemplaçar després.
    id: 2,
    peakId: 102,
    publicationId: 1002,
    peakName: "Pedraforca",
    elevation: 2506,
    region: "Bergueda",
    authorName: "Dani",
    likes: 34,
    excerpt: "Un simbol del nostre pais!",
    imageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    lat: 42.2393,
    lng: 1.7031,
  },
  {
    id: 3,
    peakId: 103,
    publicationId: 1003,
    peakName: "La Mola",
    elevation: 1104,
    region: "Valles Occidental",
    authorName: "Laia",
    likes: 19,
    excerpt: "Perfecte per un diumenge en familia!",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    lat: 41.6418,
    lng: 2.0179,
  },
  {
    // Aquestes publicacions extra ens permeten ordenar per likes i tenir més contingut al scroll.
    id: 4,
    peakId: 104,
    publicationId: 1004,
    peakName: "Puigmal",
    elevation: 2913,
    region: "Ripolles",
    authorName: "Jordi",
    likes: 41,
    excerpt: "Vistes increibles de la Cerdanya des de dalt!",
    imageUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
    lat: 42.3832,
    lng: 2.1201,
  },
  {
    id: 5,
    peakId: 105,
    publicationId: 1005,
    peakName: "Canigo",
    elevation: 2784,
    region: "Catalunya Nord",
    authorName: "Anna",
    likes: 37,
    excerpt: "El cim sagrat dels catalans!",
    imageUrl:
      "https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=900&q=80",
    lat: 42.5197,
    lng: 2.4563,
  },
  {
    id: 6,
    peakId: 106,
    publicationId: 1006,
    peakName: "Montserrat",
    elevation: 1236,
    region: "Bages",
    authorName: "Marc",
    likes: 52,
    excerpt: "Roca espectacular, paisatge unic a Catalunya.",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
    lat: 41.5930,
    lng: 1.8370,
  },
  {
    id: 7,
    peakId: 107,
    publicationId: 1007,
    peakName: "Port Aigu",
    elevation: 2443,
    region: "Alta Ribagorca",
    authorName: "Pere",
    likes: 15,
    excerpt: "Ruta tranquil·la pels Pirineus centrals.",
    imageUrl:
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=900&q=80",
    lat: 42.5501,
    lng: 0.9012,
  },
]
