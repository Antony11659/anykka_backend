import Database from 'better-sqlite3';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { insertText,
         insertSentences,
         insertSentenceTranslation } from './insertSelectData.js' 
import { createQuestion,
         incrementTranslationPopularity,
         incrementEnglishCorrectAnswer, 
         incrementChineseCorrectAnswer} from './testLib/testUtils.js';
import { chineseText, englishText } from '../lib/texts.js'
import { translateToPinyin, splitIntoSentences, checkAnswer } from '../lib/utils.js'
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

  var playGame = async (db, createQuestion) => {
    let score = 0;
    while (score < 10) {
      var question = createQuestion(db); console.log(question)
      var attempts = 3;
      var answeredCorrectly = false;

      while (attempts > 0 && !answeredCorrectly) {
      const answer = await inquirer.prompt([question]);
      var userAnswer = answer[question.name].toLowerCase();
      var { correctAnswers } = question // array

      if ( userAnswer === '.quit') {
          console.log(`🛑 Game stopped. Final score: ${score}/10`);
          return;   
      }

      if ( userAnswer.includes('.correct')) {
        var sentenceId = question.name;
        var newUserAnswer = userAnswer.replace('.correct', '')
        insertSentenceTranslation(db, sentenceId, newUserAnswer);
        answeredCorrectly = true;
        continue;
      }

      if (checkAnswer(userAnswer, correctAnswers)) {
          var sentenceId = question.name
          score++;
          answeredCorrectly = true;
          if (question.language === 'chinese') {
            incrementTranslationPopularity(db, userAnswer, correctAnswers);
            incrementEnglishCorrectAnswer(db, sentenceId);
          } else if (question.language === 'english') {
            incrementChineseCorrectAnswer(db, sentenceId);
          }
          console.log(`${chalk.green('correct')} ✅ (Score: ${score}/10)`);
          if (score === 10) break;
      } else {
         attempts--;
            if (attempts > 0) {
                console.log(`❌ Wrong! You have ${attempts} attempt(s) left. Try again:`);
            } else {
                console.log(`❌ Wrong! The correct answers are: \n ${correctAnswers.map(el => `${chalk.red(el.translation)} \n`)}`);
            }
        }
      }
    }
    console.log('🎉 Congratulations! You reached 10 points!');
    db.close();
};

playGame(db, createQuestion);