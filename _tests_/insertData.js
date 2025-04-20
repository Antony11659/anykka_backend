import chalk from 'chalk';
import { getRandomNumber } from "../lib/utils.js";
import { translateToEnglish } from "../lib/utils.js"

export const  insertText = (data, db) => {
    try {
        // Prepare the INSERT statement
        const stmt = db.prepare(`
            INSERT INTO texts (
                chinese,
                english,
                pinyin
            ) VALUES (?, ?, ?)
        `);

        // Execute the statement with the data
        const result = stmt.run(
            data.chinese,
            data.english,
            data.pinyin
        );

        console.log(`Successfully inserted text with ID: ${result.lastInsertRowid}`);
    } catch (error) {
        console.error('Error inserting text:', error.message);
    }
}

export var insertSentenceTranslation = (db, sentenceId, translation) => {
  try {
    var insert = db.prepare('INSERT INTO sentences_english_translations (sentence_id, translation) VALUES (?, ?)')
    insert.run(sentenceId, translation)
    console.log(`The translation ' ${translation} ' has inserted!`)
} catch(err) {
    console.error('Error inserting sentences translations:', err.message);
  }
};

export const insertSentences = async (db, sentences) => {
    try{
    const insert = db.prepare('INSERT INTO sentences (chinese, pinyin) VALUES (@chinese, @pinyin)'); 
    for (const sentence of sentences) {
        var result = insert.run(sentence)
        var sentenceId = result.lastInsertRowid
        var englishTranslation = await translateToEnglish(sentence.chinese);
        insertSentenceTranslation(db, sentenceId, englishTranslation);
    }
    console.log('inserted sentences successfully!')
    } catch (error) {
        console.error('Error inserting sentences:', error.message);
    }
}

const selectSentence = (db, sentenceId) => {
    const sentence = db.prepare(`SELECT * FROM sentences WHERE id = ?`).get(sentenceId);
    var sentenceTranslations = db.prepare(`SELECT translation FROM sentences_english_translations WHERE sentence_id = ?`).all(sentenceId)
    return {...sentence, translation: [...sentenceTranslations ]}
};

export const createQuestion = (db) => {
    const sentenceId = getRandomNumber(1, 3)
    const sentence = selectSentence(db, sentenceId);
    var { translation } = sentence;
    const question = {
        type: 'input',
        name:  `${sentenceId}`,
        message: `${chalk.green(sentence.chinese)} (${sentence.pinyin})\n`,
        correctAnswers: translation,
      };
    return question;
};
export const createPreviousQuestion = (db, sentenceId) => {
    const sentence = selectSentence(db, sentenceId);
    var { translation } = sentence;
    const question = {
        type: 'input',
        name:  `${sentenceId}`,
        message: `Type your translation: ${chalk.green(sentence.chinese)} (${sentence.pinyin})\n`,
        correctAnswer: translation,
      };
    return question;
};