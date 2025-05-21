import axios from 'axios';

const RANDOMMER_API_KEY = '14798416b2cd4a1aab647a97880fce2b';

const getRandomUser = async () => {
  const res = await axios.get('https://randomuser.me/api/');
  const user = res.data.results[0];
  return {
    name: `${user.name.first} ${user.name.last}`,
    email: user.email,
    gender: user.gender,
    location: `${user.location.city}, ${user.location.country}`,
    picture: user.picture.large
  };
};

const getRandommerData = async (endpoint) => {
  const res = await axios.get(`https://randommer.io/api/${endpoint}`, {
    headers: { 'X-Api-Key': RANDOMMER_API_KEY }
  });
  return res.data;
};

const getQuote = async () => {
  const res = await axios.get('https://api.quotable.io/random');
  return {
    content: res.data.content,
    author: res.data.author
  };
};

const getJoke = async () => {
  const res = await axios.get('https://v2.jokeapi.dev/joke/Programming?type=single');
  return {
    type: res.data.category,
    content: res.data.joke
  };
};

const Pipeline = class Pipeline {
  constructor(app) {
    this.app = app;
    this.run();
  }

  run() {
    this.app.get('/pipeline', async (req, res) => {
      try {
        const [user, phone, iban, name, pet, card, quote, joke] = await Promise.all([
          getRandomUser(),
          getRandommerData('Phone/Generate'),
          getRandommerData('IBAN'),
          getRandommerData('Name'),
          getRandommerData('Animals'),
          getRandommerData('Card'),
          getQuote(),
          getJoke()
        ]);

        const profile = {
          user,
          phone_number: phone,
          iban,
          credit_card: {
            card_number: card.cardNumber,
            card_type: card.cardType,
            expiration_date: card.date,
            cvv: card.cvv
          },
          random_name: name,
          pet: pet[0],
          quote,
          joke
        };

        res.status(200).json(profile);
      } catch (error) {
        console.error('[ERROR] pipeline ->', error.message);
        res.status(500).json({ error: 'Erreur lors de la génération du profil' });
      }
    });
  }
};

export default Pipeline;
