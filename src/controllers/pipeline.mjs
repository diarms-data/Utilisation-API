import axios from 'axios';

const API_KEY = '0fa217d735d54efeb17836e2f5e06837';

const Pipeline = class Pipeline {
  constructor(app) {
    this.app = app;
    this.run();
  }

  getRandomUser() {
    this.app.get('/random-user', async (req, res) => {
      try {
        const { data } = await axios.get('https://randomuser.me/api/');
        const user = data.results[0];
        res.status(200).json({
          name: `${user.name.first} ${user.name.last}`,
          email: user.email,
          gender: user.gender,
          location: `${user.location.city}, ${user.location.country}`,
          picture: user.picture.large
        });
      } catch (err) {
        console.error('[ERROR] /random-user ->', err);
        res.status(500).json({ message: 'Erreur utilisateur aléatoire' });
      }
    });
  }

  getRandomPhone() {
    this.app.get('/random-phone', async (req, res) => {
      try {
        const { data } = await axios.get(
          'https://randommer.io/api/Phone/Generate?CountryCode=FR&Quantity=1',
          { headers: { 'X-Api-Key': API_KEY } }
        );
        res.status(200).json({ phone_number: data });
      } catch (err) {
        console.error('[ERROR] /random-phone ->', err);
        res.status(500).json({ message: 'Erreur téléphone' });
      }
    });
  }

  getRandomIBAN() {
    this.app.get('/random-iban', async (req, res) => {
      try {
        const { data } = await axios.get(
          'https://randommer.io/api/Finance/Iban/FR',
          { headers: { 'X-Api-Key': API_KEY } }
        );
        res.status(200).json({ iban: data });
      } catch (err) {
        console.error('[ERROR] /random-iban ->', err);
        res.status(500).json({ message: 'Erreur IBAN' });
      }
    });
  }

  getRandomCreditCard() {
    this.app.get('/random-credit-card', async (req, res) => {
      try {
        const { data } = await axios.get(
          'https://randommer.io/api/Card?type=Visa',
          { headers: { 'X-Api-Key': API_KEY } }
        );
        res.status(200).json({
          credit_card: {
            card_number: data.cardNumber,
            card_type: data.type,
            expiration_date: data.date,
            cvv: data.cvv
          }
        });
      } catch (err) {
        console.error('[ERROR] /random-credit-card ->', err);
        res.status(500).json({ message: 'Erreur carte' });
      }
    });
  }

  getRandomName() {
    this.app.get('/random-name', async (req, res) => {
      try {
        const { data } = await axios.get(
          'https://randommer.io/api/Name?nameType=firstname&quantity=1',
          { headers: { 'X-Api-Key': API_KEY } }
        );
        res.status(200).json({ random_name: data[0] });
      } catch (err) {
        console.error('[ERROR] /random-name ->', err);
        res.status(500).json({ message: 'Erreur nom aléatoire' });
      }
    });
  }

  getRandomQuote() {
    this.app.get('/random-quote', async (req, res) => {
      try {
        const { data } = await axios.get('https://api.viewbits.com/v1/zenquotes?mode=batch');
        const quote = data[0];
        res.status(200).json({
          quote: {
            content: quote.q,
            author: quote.a
          }
        });
      } catch (err) {
        console.error('[ERROR] /random-quote ->', err);
        res.status(500).json({ message: 'Erreur citation' });
      }
    });
  }

  getRandomJoke() {
    this.app.get('/random-joke', async (req, res) => {
      try {
        const { data } = await axios.get('https://official-joke-api.appspot.com/jokes/programming/random');
        const joke = data[0];
        res.status(200).json({
          joke: {
            type: joke.type,
            content: `${joke.setup} ${joke.punchline}`
          }
        });
      } catch (err) {
        console.error('[ERROR] /random-joke ->', err);
        res.status(500).json({ message: 'Erreur blague' });
      }
    });
  }

  getCompleteProfile() {
    this.app.get('/pipeline', async (req, res) => {
      try {
        const dataUser = await axios.get('https://randomuser.me/api/');
        const user = dataUser.data.results[0];
        const dataPhone = await axios.get(
          'https://randommer.io/api/Phone/Generate?CountryCode=FR&Quantity=1',
          { headers: { 'X-Api-Key': API_KEY } }
        );
        const dataIban = await axios.get(
          'https://randommer.io/api/Finance/Iban/FR',
          { headers: { 'X-Api-Key': API_KEY } }
        );
        const dataCard = await axios.get(
          'https://randommer.io/api/Card?type=Visa',
          { headers: { 'X-Api-Key': API_KEY } }
        );
        const card = dataCard.data;
        const dataName = await axios.get(
          'https://randommer.io/api/Name?nameType=firstname&quantity=1',
          { headers: { 'X-Api-Key': API_KEY } }
        );
        const dataQuote = await axios.get('https://api.viewbits.com/v1/zenquotes?mode=batch');
        const quote = dataQuote.data[0];
        const dataJoke = await axios.get('https://official-joke-api.appspot.com/jokes/programming/random');
        const joke = dataJoke.data[0];
        res.status(200).json({
          user: {
            name: `${user.name.first} ${user.name.last}`,
            email: user.email,
            gender: user.gender,
            location: `${user.location.city}, ${user.location.country}`,
            picture: user.picture.large
          },
          phone_number: dataPhone.data[0],
          iban: dataIban.data,
          credit_card: {
            card_number: card.cardNumber,
            card_type: card.type,
            expiration_date: card.date,
            cvv: card.cvv
          },
          random_name: dataName.data[0],
          quote: {
            content: quote.q,
            author: quote.a
          },
          joke: {
            type: joke.type,
            content: `${joke.setup} ${joke.punchline}`
          }
        });
      } catch (err) {
        console.error('[ERROR] /profile ->', err);
        res.status(500).json({ message: 'Erreur lors de la création du profil complet' });
      }
    });
  }

  run() {
    this.getRandomUser();
    this.getRandomPhone();
    this.getRandomIBAN();
    this.getRandomCreditCard();
    this.getRandomName();
    this.getRandomQuote();
    this.getRandomJoke();
    this.getCompleteProfile();
  }
};

export default Pipeline;