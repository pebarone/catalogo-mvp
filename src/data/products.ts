export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Pulseira Mickey Arco-Íris",
    price: 25.00,
    description: "Pulseira colorida com pingentes do Mickey e contas em tons pastéis. Feita à mão com muito carinho!",
    category: "Pulseiras",
    image: "/produto1.jpg"
  },
  {
    id: 2,
    name: "Colar Ursinho Gummy",
    price: 35.00,
    description: "Colar divertido com pingente de ursinho estilo gummy bear translúcido. Disponível em várias cores.",
    category: "Colares",
    image: "/produto2.jpg"
  },
  {
    id: 3,
    name: "Chaveiro Disney Magic",
    price: 18.00,
    description: "Chaveiro temático da Disney com brilhos e cores vibrantes. Perfeito para sua mochila!",
    category: "Chaveiros",
    image: "/produto3.jpg"
  },
  {
    id: 4,
    name: "Strap Phone Colorido",
    price: 22.00,
    description: "Salva-celular (phone strap) feito com miçangas coloridas e divertidas. Protege e enfeita!",
    category: "Acessórios",
    image: "/produto1.jpg"
  },
  {
    id: 5,
    name: "Tiara Orelhinhas Brilho",
    price: 45.00,
    description: "Tiara com orelhinhas estilo parque, cheia de lantejoulas e muito brilho para você arrasar.",
    category: "Tiaras",
    image: "/produto2.jpg"
  },
  {
    id: 6,
    name: "Conjunto Pulseiras BFF",
    price: 40.00,
    description: "Kit com duas pulseiras para você e sua melhor amiga. Cores complementares e muito amor.",
    category: "Pulseiras",
    image: "/produto3.jpg"
  }
];