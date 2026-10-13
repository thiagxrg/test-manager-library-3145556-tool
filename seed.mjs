// seed.mjs - demo seeder for Manager Library through the API
// Usage: API_URL=http://localhost:8000/api/v1 ADMIN_USERNAME=admin ADMIN_PASSWORD=change-me node seed.mjs

const API = (process.env.API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';
const BOOKS_COUNT = 40;
const MEMBERS_COUNT = 10;
const LOANS_COUNT = 15;

const req = async (method, path, body, token) => {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return json;
};

const login = async () => {
  const r = await req('POST', '/auth/login', { username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
  return r.access_token;
};

const titles = [
  'Cien años de soledad', 'Don Quijote de la Mancha', 'El principito', 'Rayuela', 'Ficciones',
  'La metamorfosis', '1984', 'Un mundo feliz', 'El túnel', 'Pedro Páramo',
  'La ciudad y los perros', 'Crónica de una muerte anunciada', 'Los detectives salvajes', 'El amor en los tiempos del cólera', 'La sombra del viento',
  'El nombre de la rosa', 'La conjura de los necios', 'El código Da Vinci', 'Ángeles y demonios', 'Inferno',
  'El alquimista', 'Brida', 'Veronika decide morir', 'Once minutos', 'La bruja de Portobello',
  'El poder de ahora', 'Los juegos del hambre', 'En llamas', 'Sinsajo', 'Harry Potter y la piedra filosofal',
  'Harry Potter y la cámara secreta', 'El señor de los anillos', 'Las dos torres', 'El retorno del rey', 'El hobbit',
  'Los pilares de la Tierra', 'Un mundo sin fin', 'La caída de los gigantes', 'El invierno del mundo', 'El umbral de la eternidad',
];

const authors = ['Gabriel García Márquez', 'Miguel de Cervantes', 'Antoine de Saint-Exupéry', 'Julio Cortázar', 'Jorge Luis Borges'];

const main = async () => {
  console.log(`API: ${API}`);
  const token = await login();
  console.log('Login OK');

  const categories = await req('GET', '/categories', null, token);
  console.log(`Categories: ${categories.length}`);

  const bookIds = [];
  for (let i = 0; i < BOOKS_COUNT; i++) {
    const book = await req('POST', '/books', {
      title: titles[i % titles.length],
      author: authors[i % authors.length],
      isbn: `978${String(1000000000 + i).slice(0, 10)}`,
      category_id: categories[i % categories.length].id,
      total_copies: 2 + (i % 4),
    }, token);
    bookIds.push(book.id);
    if ((i + 1) % 10 === 0) console.log(`Books: ${i + 1}/${BOOKS_COUNT}`);
  }

  const memberIds = [];
  for (let i = 0; i < MEMBERS_COUNT; i++) {
    const member = await req('POST', '/members', {
      full_name: `Socio Demo ${i + 1}`,
      document_number: `${1000 + i}`,
    }, token);
    memberIds.push(member.id);
  }
  console.log(`Members: ${memberIds.length}`);

  let createdLoans = 0;
  for (let i = 0; i < LOANS_COUNT && createdLoans < LOANS_COUNT; i++) {
    const member = memberIds[i % memberIds.length];
    const bookA = bookIds[i % bookIds.length];
    const bookB = bookIds[(i + 7) % bookIds.length];
    const items = [{ book_id: bookA }];
    if (bookA !== bookB) items.push({ book_id: bookB });
    try {
      await req('POST', '/loans', { member_id: member, items }, token);
      createdLoans++;
    } catch (e) {
      console.log(`Loan skipped: ${e.message}`);
    }
  }
  console.log(`Loans created: ${createdLoans}`);
  console.log('Seed finished');
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});