import Database from 'better-sqlite3';
import inquirer from 'inquirer';
import stringSimilarity from "string-similarity";
import chalk from 'chalk';
import { insertText, insertSentences, createQuestion, insertSentenceTranslation, createPreviousQuestion} from './insertData.js';
import { chineseText, englishText } from '../lib/texts.js'
import { translateToPinyin } from '../lib/utils.js'
import { splitIntoSentences } from '../lib/utils.js'
import { createTextTable, createSentencesTable, createSentenceEnglishTranslationsTable} from './createTestDB.js';

const db = new Database(':memory:');

const data = {
    chinese: chineseText,
    english: englishText,
    pinyin: translateToPinyin(chineseText)
  }


// prepare DB
  createTextTable(db);
  createSentencesTable(db);
  createSentenceEnglishTranslationsTable(db);
  insertText(data, db);
  const chText = db.prepare("SELECT chinese FROM texts").all()
  const sentences = splitIntoSentences(chText[0].chinese);
  await insertSentences(db, sentences);

var checkAnswer = (userAnswer, correctAnswers) => {
    var similarities = correctAnswers.map(el => {
      var correctAnswer = el.translation.toLowerCase();
      return stringSimilarity.compareTwoStrings(userAnswer,correctAnswer)
    }).filter(el => el >= 0.8);
    return similarities.length > 0;
}

  const playGame = async (db, createQuestion) => {
    let score = 0;
    var previousQuestion = null;
    while (score < 10) { // Loop until score reaches 10
      const question = createQuestion(db);
      const answer = await inquirer.prompt([question]);
      var userAnswer = answer[question.name].toLowerCase();
      var { correctAnswers } = question // array

      if ( userAnswer === '.quit') {
          console.log(`🛑 Game stopped. Final score: ${score}/10`);
          return; // Exit the game   
      }

      if ( userAnswer === '.correct' ) {
        var newAnswer = await inquirer.prompt([previousQuestion]);
        var newUserAnswer = newAnswer[previousQuestion.name].toLowerCase();
        var sentenceId = previousQuestion.name
        insertSentenceTranslation(db, sentenceId, newUserAnswer);
        continue;
      }

      if (checkAnswer(userAnswer, correctAnswers)) {
          score++;
          previousQuestion = null;
          console.log(`✅ Correct! (Score: ${score}/10)`);
          if (score === 10) break; // Exit loop on victory
      } else {
          var sentenceId = question.name
          previousQuestion = createPreviousQuestion(db, sentenceId);
          console.log(previousQuestion)
          console.log(`❌ Wrong! The correct answers are: \n${correctAnswers.map(el => `${chalk.red(el.translation)}\n`)}`);
      }

    }
    console.log('🎉 Congratulations! You reached 10 points!');
    db.close();
};

playGame(db, createQuestion);