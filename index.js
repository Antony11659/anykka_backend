import Database from 'better-sqlite3';

const db = new Database('chinese_learning.db');

db.pragma('foreign_keys = ON');

async function getAllWords() {
  try {
      const stmt = db.prepare('SELECT * FROM words');
      const words = stmt.all();
      
      console.log('Found words:', words.length);
      console.table(words); // Nicely formatted output
      
      return words;
  } catch (error) {
      console.error('Error fetching words:', error);
      throw error;
  }
}

getAllWords();





// import Fastify from 'fastify'

// const fastify = Fastify({
//     logger: true
//   })


//   // Declare a route
// fastify.get('/', function (request, reply) {
//     reply.send({ hello: 'world' })
//   })
  

//   // Run the server!
//   fastify.listen({ port: 3001 }, function (err, address) {
//     if (err) {
//       fastify.log.error(err)
//       process.exit(1)
//     }
//     // Server is now listening on ${address}
//   })