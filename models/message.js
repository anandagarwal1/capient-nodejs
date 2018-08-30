"use strict";

// Message is a base class
class Message {

    constructor() {

    }

    set alias(_alias) {
        this.alias = _alias;
    }
    get alias() {
        return this.alias;
    }

    set srcLang(_srcLang) {
        this.srcLang = _srcLang;
    }
    get srcLang() {
        return this.srcLang;
    }

    set srcText(_srcText) {
        this.srcText = _srcText;
    }
    get srcText() {
        return this.srcText;
    }

    set timestamp(_timestamp) {
        this.timestamp = _timestamp;
    }
    get timestamp() {
        return this.timestamp;
    }

    set destLang(_destLang) {
        this.destLang = _destLang;
    }
    get destLang() {
        return this.destLang;
    }

    set ttsEnabled(_ttsEnabled) {
        this.ttsEnabled = _ttsEnabled;
    }
    get ttsEnabled() {
        return this.ttsEnabled;
    }

    set desc(_desc) {
        this.desc = _desc;
    }
    get desc() {
        return this.desc;
    }

    set translation(_translation) {
        this.translation = _translation;
    }
    get translation() {
        return this.translation;
    }

}

module.exports = Message;