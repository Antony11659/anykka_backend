import chalk from 'chalk';
import stringSimilarity from "string-similarity";
import { getRandomNumber } from '../../lib/utils.js';
import { selectSentence } from '../insertSelectData.js';


var generatePopularTranslation = (translations) => {
    return translations.sort((a,b) => a.popularity - b.popularity).reverse()[0].translation
};

var createMessageAnswer = (db, sentence) => {
    var message = {};
    var  { amountOfCorrectEnglishAnswers } = db.prepare(`SELECT correct_answers_english as amountOfCorrectEnglishAnswers FROM sentences WHERE id = ?`).get(sentence.id);
    if(amountOfCorrectEnglishAnswers > 1){
        var englishMessage = generatePopularTranslation(sentence.translation);
        var chineseAnswer = [{translation: sentence.chinese}];
        message.message = `${chalk.green(englishMessage)}\n`;
        message.answer = chineseAnswer;
        message.type = 'english';
    } else {
        var chineseMessage =  `${chalk.green(sentence.chinese)} (${sentence.pinyin})\n`;
        var englishAnswer = sentence.translation;
        message.message = chineseMessage;
        message.answer = englishAnswer;
        message.type = 'chinese';
    }

    return message;
}

export const createQuestion = (db, sentenceId = getRandomNumber(1, 3)) => {

    const sentence = selectSentence(db, sentenceId);
    var { message, answer, type } = createMessageAnswer(db, sentence);
    const question = { 
        type: 'input',
        name:  `${sentenceId}`,
        message: message,
        correctAnswers: answer,
        language: type,
      };
    return question;
};

export var incrementTranslationPopularity = (db, userAnswer, correctAnswers) => {
    var similarities = correctAnswers.map(el => {
        var correctAnswer = el.translation.toLowerCase();
        return { id: el.id, similarity: stringSimilarity.compareTwoStrings(userAnswer,correctAnswer)}
      });
    
    var maxSimilarAnswer = similarities.reduce((max, current) => 
      current.similarity > max.similarity ? current : max
    );

    var { id } = maxSimilarAnswer;

    var result = db.prepare(`
        UPDATE sentences_english_translations
        SET popularity = popularity + 1
        WHERE id = ?
    `);

    result.run(id);
};

export var incrementEnglishCorrectAnswer = (db, sentenceId) => {
    var result = db.prepare(`
        UPDATE sentences
        SET correct_answers_english = correct_answers_english + 1
        WHERE id = ?
        `);

    result.run(sentenceId);
}


export var incrementChineseCorrectAnswer = (db, sentenceId) => {
    var result = db.prepare(`
        UPDATE sentences
        SET correct_answers_english = correct_answers_chinese + 1
        WHERE id = ?
        `);

    result.run(sentenceId);
}