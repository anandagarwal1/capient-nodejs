exports.lookup = (destLang, gender) => {

    var lang = 'none';
    var voice = '';

    // English
    if (destLang === 'en') {
        lang = 'eng-USA';
        if (gender === 'F') {
            voice = 'Samantha';
        }
        else {
            voice = 'Tom';
        }
    }
    // Spanish
    if (destLang === 'es') {
        lang = 'spa-MEX';
        if (gender === 'F') {
            voice = 'Paulina';
        }
        else {
            voice = 'Juan';
        }
    }
    // Korean
    if (destLang === 'ko') {
        lang = 'kor-KOR';
        voice = 'Sora';
    }
    // Russian
    if (destLang === 'ru') {
        lang = 'rus-RUS';
        if (gender === 'F') {
            voice = 'Milena';
        }
        else {
            voice = 'Yuri';
        }
    }

    // MAndarin
    // zh-Hans
    if (destLang === 'zh-Hans') {
        lang = 'cmn-CHN';
        if (gender === 'F') {
            voice = 'Tian-Tian';
        }
        else {
            voice = 'Tian-Tian';
        }
    }

    // Hindi
    if (destLang === 'hi') {
        lang = 'hin-IND';
        if (gender === 'F') {
            voice = 'Lekha';
        }
        else {
            voice = 'Lekha';
        }
    }

    return { lang: lang, voice: voice };

}