
export const createTextTable = (db) => {
  try {
    // Use transaction for schema changes
    db.transaction(() => {
      // Create texts table with all required fields
      db.prepare(`
        CREATE TABLE IF NOT EXISTS texts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chinese TEXT NOT NULL CHECK(length(chinese) > 0),
          english TEXT NOT NULL CHECK(length(english) > 0),
          pinyin TEXT CHECK(pinyin IS NULL OR length(pinyin) > 0),
          hsk_level INTEGER CHECK(hsk_level BETWEEN 1 AND 6),
          is_ready BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    })(); // Immediately execute the transaction

    console.log('Texts table created or verified');
  } catch (error) {
    console.error('Database creation failed:', error.message);
    process.exit(1); // Exit if we can't set up the database
  }
};
export const createSentenceEnglishTranslationsTable = (db) => {
  try {
    // Use transaction for schema changes
    db.transaction(() => {
      // Create texts table with all required fields
      db.prepare(`
        CREATE TABLE sentences_english_translations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sentence_id INTEGER NOT NULL,
          translation TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sentence_id) REFERENCES sentences(id) ON DELETE CASCADE
);
      `).run();
    })(); // Immediately execute the transaction
  } catch (error) {
    console.error('Database creation failed:', error.message);
    process.exit(1); // Exit if we can't set up the database
  }
};

export const createSentencesTable = (db) => {
  try {
    // Use transactions for schema changes
    db.transaction(() => {
      // Use IF NOT EXISTS to avoid errors
      db.prepare(`
        CREATE TABLE IF NOT EXISTS sentences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          
          -- Core content
          chinese TEXT NOT NULL CHECK(length(chinese) > 0),
          pinyin TEXT CHECK(pinyin IS NULL OR length(pinyin) > 0),
        
          -- Attempt tracking with constraints
          attempts_total INTEGER NOT NULL DEFAULT 0 CHECK(attempts_total >= 0),
          attempts_english INTEGER NOT NULL DEFAULT 0 CHECK(attempts_english >= 0),
          attempts_chinese INTEGER NOT NULL DEFAULT 0 CHECK(attempts_chinese >= 0),
          
          -- Practice preferences
          english_guess INTEGER NOT NULL DEFAULT 1 CHECK(english_guess IN (0, 1)),
          chinese_guess INTEGER NOT NULL DEFAULT 0 CHECK(chinese_guess IN (0, 1)),
          
          -- Correct guesses with constraints
          correct_english INTEGER NOT NULL DEFAULT 0 
            CHECK(correct_english >= 0 AND correct_english <= attempts_english),
          correct_chinese INTEGER NOT NULL DEFAULT 0 
            CHECK(correct_chinese >= 0 AND correct_chinese <= attempts_chinese),
          
          -- Timestamps
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      console.log('Sentences table created or verified');
    })(); // Immediately execute the transaction
  } catch (error) {
    console.error('Database creation of sentences failed:', error.message);
    process.exit(1); // Exit if we can't set up the database
  }
};
